# Osiris to Aucctus Porting Reference

Detailed patterns and examples for porting Django backend to React TypeScript frontend.

## Model to TypeScript Interface Conversion

### ModelSchema Analysis Process

When analyzing Django Ninja schemas:

1. **Start with Schema Meta configuration**:
   - `model = CustomerProfile` - base fields come from this model
   - `exclude = ["concept", "conversations"]` - these model fields are NOT in the API response
   - `fields_optional = "__all__"` (if present) - all fields become optional

2. **Include Schema-defined fields** (override model fields):
   - Explicit field definitions take precedence
   - Look for `List[RelatedSchema]` patterns
   - Include computed properties from model

3. **Include Model fields not excluded**:
   - All model fields except those in `exclude` list
   - Apply transformations from resolver methods

### Complete Example

**Backend Model:**
```python
class CustomerProfile(BaseConceptReportModel):
    uuid = models.UUIDField(default=uuid.uuid4)
    name = models.CharField(max_length=255)
    description = models.TextField()
    age_upper = models.SmallIntegerField()
    age_lower = models.SmallIntegerField()
    income_upper = models.BigIntegerField()
    income_lower = models.BigIntegerField()
    is_primary = models.BooleanField(default=False)
    concept = models.ForeignKey("concepts.Concept")
    avatar_url = models.URLField(null=True, blank=True)

    @property
    def age_range(self):
        return f"{self.age_lower} - {self.age_upper}"

    @property
    def income_range(self):
        return f"${self.income_lower} - ${self.income_upper}"
```

**Backend Schema:**
```python
class CustomerProfileSchema(ModelSchema):
    name: str
    segment: str
    description: str
    jobs: List[CustomerJobSchema]
    pains: List[CustomerPainSchema]
    age_range: str
    income_range: str

    @staticmethod
    def resolve_jobs(obj):
        return obj.customer_jobs.all()

    @staticmethod
    def resolve_avatar_url(obj: CustomerProfile):
        return obj.presign_avatar_url()

    class Meta:
        model = CustomerProfile
        exclude = ["concept", "conversations"]
```

**Frontend Interface:**
```typescript
export interface ICustomerProfile extends IBaseConceptEntity {
  // Model fields (not excluded)
  uuid: string;
  name: string;
  description: string;
  segment: string;
  ageUpper: number;
  ageLower: number;
  incomeUpper: number;
  incomeLower: number;
  isPrimary: boolean;
  avatarUrl?: string;

  // Computed properties from model
  ageRange: string;
  incomeRange: string;

  // Related entities (from resolvers)
  jobs: ICustomerJob[];
  pains: ICustomerPain[];
}
```

### Schema Analysis Checklist

- [ ] Check Schema Type (`ModelSchema` vs regular `Schema`)
- [ ] Examine Meta configuration (`model`, `exclude`, `fields`, `fields_optional`)
- [ ] Look for Schema field overrides
- [ ] Find resolver methods (`resolve_*`)
- [ ] Include model `@property` methods
- [ ] Handle nested schemas

## Routes to API Endpoints Conversion

### Django Route → Frontend Endpoint

**Backend:**
```python
@router.get("/{concept_uuid}/customer-profile", response=list[CustomerProfileSchema])
async def get_all(request: HttpRequest, concept_uuid: str):
    profiles = await CustomerProfileService.aget_all(request, concept_uuid=concept_uuid)
    return profiles

@router.post("/{concept_uuid}/customer-profile", response=CustomerProfileSchema)
async def create_customer_profile(request: HttpRequest, concept_uuid: str, data: CreateCustomerProfileSchema):
    return new_profile
```

**Frontend Endpoints (`src/libs/api/endpoints.ts`):**
```typescript
export class Endpoints {
  static conceptCustomerProfiles(conceptUuid: string, version: 'v1' | 'v2' = 'v1') {
    return `api/${version}/concept/${conceptUuid}/customer-profile`;
  }

  static conceptCustomerProfileUuid(customerProfileUuid: string) {
    return `api/v2/concept/customer-profile/${customerProfileUuid}`;
  }
}
```

**Frontend API Service (`src/libs/api/concepts.ts`):**
```typescript
export class ConceptApi extends ApiService {
  getConceptCustomerProfiles(uuid: string) {
    return this.get<IPageResponse<ICustomerProfile>>(
      endpoints.conceptCustomerProfiles(uuid, 'v2')
    );
  }

  createConceptCustomerProfile(conceptUuid: string, data: ICustomerProfileCreate) {
    return this.post<ICustomerProfile, ICustomerProfileCreate>(
      endpoints.conceptCustomerProfiles(conceptUuid, 'v2'),
      data
    );
  }

  updateConceptCustomerProfile(customerProfileUuid: string, data: Partial<ICustomerProfile>) {
    return this.patch<ICustomerProfile, Partial<ICustomerProfile>>(
      endpoints.conceptCustomerProfileUuid(customerProfileUuid),
      data
    );
  }
}
```

**Frontend React Query Hooks (`src/app/hooks/query/concepts.hook.ts`):**
```typescript
export const useConceptCustomerProfiles = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.customerProfiles, uuid],
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 2,
    queryFn: async () => await api.concept.getConceptCustomerProfiles(uuid),
    enabled: !!uuid,
  });

  return { ...query, profiles: query.data?.results || [] };
};

export const useCustomerProfileCreate = (conceptUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICustomerProfileCreate) =>
      api.concept.createConceptCustomerProfile(conceptUuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.customerProfiles, conceptUuid],
      });
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to create customer profile');
    },
  });
};
```

## Nested Resource Patterns

### Parent-Child Resource Routing

**Backend:**
```python
@router.get("/customer-profile/{customer_profile_uuid}/jobs")
@router.post("/customer-profile/{customer_profile_uuid}/jobs")
@router.get("/customer-profile/{customer_profile_uuid}/jobs/{uuid}")
@router.patch("/customer-profile/{customer_profile_uuid}/jobs/{uuid}")
@router.delete("/customer-profile/{customer_profile_uuid}/jobs/{uuid}")
```

**Frontend Endpoints:**
```typescript
static customerProfileJobs(customerProfileUuid: string) {
  return `/api/v2/concept/customer-profile/${customerProfileUuid}/jobs`;
}
static customerProfileJob(customerProfileUuid: string, jobUuid: string) {
  return `/api/v2/concept/customer-profile/${customerProfileUuid}/jobs/${jobUuid}`;
}
```

**Frontend API Methods:**
```typescript
getCustomerJobs(customerProfileUuid: string) {
  return this.get<ICustomerJob[]>(
    endpoints.customerProfileJobs(customerProfileUuid)
  );
}

createCustomerJob(customerProfileUuid: string, data: { description: string; order?: number }) {
  return this.post<ICustomerJob>(
    endpoints.customerProfileJobs(customerProfileUuid),
    data
  );
}
```

**Frontend Query Keys:**
```typescript
[AucctusQueryKeys.customerProfile, customerProfileUuid, 'jobs']
```

## Query Key Patterns

### Hierarchical Query Keys

```typescript
export const AucctusQueryKeys = {
  // Parent resources
  concepts: 'concepts',
  customerProfiles: 'customerProfiles',

  // Single resources
  concept: 'concept',
  customerProfile: 'customerProfile',

  // Nested resources
  customerJob: 'customerJob',
  customerPain: 'customerPain',
} as const;

// Usage patterns:
[AucctusQueryKeys.customerProfiles, conceptUuid]              // List
[AucctusQueryKeys.customerProfile, profileUuid]               // Single
[AucctusQueryKeys.customerProfile, profileUuid, 'jobs']       // Nested list
[AucctusQueryKeys.customerJob, profileUuid, jobUuid]          // Nested single
```

## Pagination Patterns

**Backend:**
```python
@paginate(AucctusPageNumberPagination)
async def get_all(request: HttpRequest, concept_uuid: str):
    return profiles
```

**Frontend Interface:**
```typescript
export interface IPageResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}
```

**Frontend Hook with Pagination:**
```typescript
export const useCustomerProfiles = (conceptUuid: string, page?: number) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.customerProfiles, conceptUuid, page],
    queryFn: async () => await api.concept.getConceptCustomerProfiles(conceptUuid, { page }),
    keepPreviousData: true,
  });
};
```

## Validation Patterns

**Backend:**
```python
class CreateCustomerProfileSchema(Schema):
    name: str = Field(..., min_length=1, max_length=255)
    age_upper: int = Field(..., ge=0, le=150)
    family_size: int = Field(..., ge=1)
```

**Frontend (Zod):**
```typescript
const customerProfileSchema = z.object({
  name: z.string().min(1).max(255),
  ageUpper: z.number().min(0).max(150),
  familySize: z.number().min(1),
});

type CustomerProfileFormData = z.infer<typeof customerProfileSchema>;
```

## Error Handling Patterns

**Backend:**
```python
raise PermissionDenied(_("Customer profile does not belong to your account."))
```

**Frontend:**
```typescript
onError: (e) => {
  const message = utils.osiris.parseFormError(e);
  toast.error(message || 'Default error message');
}
```

## Cache Invalidation Patterns

**Frontend (on mutation success):**
```typescript
onSuccess: (_data, variables) => {
  queryClient.invalidateQueries({
    queryKey: [AucctusQueryKeys.customerProfiles, variables.conceptUuid],
  });
  queryClient.invalidateQueries({
    queryKey: [AucctusQueryKeys.customerProfile, variables.profileUuid],
  });
},
```

## File Structure Conventions

```
src/
├── libs/api/
│   ├── endpoints.ts           # All API endpoints
│   ├── concepts.ts            # Concept-related API methods
│   └── types/
│       └── concept/
│           ├── concepts.d.ts  # Main concept interfaces
│           └── customer_profile.d.ts  # Profile-specific interfaces
├── app/hooks/query/
│   ├── concepts.hook.ts       # All concept-related hooks
│   └── query-keys.ts          # Centralized query keys
└── components/
    └── CustomerProfile/       # Component implementations
```

## Key Guidelines Summary

1. **Naming**: Convert `snake_case` to `camelCase`
2. **Type Safety**: Separate interfaces for Create, Update, Response
3. **Query Keys**: Mirror Django URL structure
4. **Error Handling**: Always provide fallback messages
5. **Cache Management**: Invalidate parent collections when children change
6. **Performance**: Use `enabled` option, proper loading states
7. **API Versioning**: Support version parameters, default to latest
