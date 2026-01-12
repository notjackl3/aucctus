---
name: osiris-aucctus-porting
description: Port Django backend (Osiris) code to React TypeScript frontend (Aucctus). Use when porting Django models/schemas to TypeScript interfaces, converting Django routes to API endpoints, creating React Query hooks from Django services, or migrating backend patterns to frontend code.
---

# Osiris to Aucctus Porting

Port Django backend implementations to React TypeScript frontend code following established Aucctus patterns.

## Quick Start

When porting from Osiris (Django) to Aucctus (React TypeScript):

1. **Identify the backend source**: Models, Schemas, Routes, or Services
2. **Determine the frontend target**: Types, Endpoints, API methods, or Hooks
3. **Follow the mapping rules** for each conversion type

## Directory Mapping

| Backend (Django)    | Frontend (React TypeScript) |
|--------------------|-----------------------------|
| `models/`          | `types/` (interfaces)       |
| `schemas/`         | `types/` (API schemas)      |
| `routes/`          | `api/` (endpoints & services)|
| `services/`        | `hooks/` (React Query hooks)|
| `tasks/`           | `hooks/` (async operations) |
| `events/`          | `hooks/` (event handling)   |

## Core Conversion Rules

### 1. Schema to TypeScript Interface

**Critical**: Frontend interfaces come from **Django Ninja Schemas**, not Models directly.

For `ModelSchema`:
1. Check `Meta.exclude` - these fields are NOT in API response
2. Include schema-defined fields (override model fields)
3. Include model `@property` methods referenced in schema
4. Look for `resolve_*` methods that add computed/related data

For regular `Schema`:
- Direct field mapping from schema definition

### 2. Naming Conventions

- Convert `snake_case` to `camelCase`
- `age_upper` → `ageUpper`
- `is_primary` → `isPrimary`

### 3. Type Mappings

| Python Type | TypeScript Type |
|-------------|-----------------|
| `str` | `string` |
| `int` | `number` |
| `float` | `number` |
| `bool` | `boolean` |
| `Optional[T]` | `T \| undefined` or `T?` |
| `List[T]` | `T[]` |
| `Dict[str, T]` | `Record<string, T>` |
| `UUID` | `string` |

## Conversion Workflow

### Step 1: Create TypeScript Interfaces

Location: `src/libs/api/types/`

```typescript
export interface IEntityName {
  uuid: string;
  fieldName: string;  // from snake_case
  relatedItems: IRelatedItem[];  // from List[RelatedSchema]
}
```

### Step 2: Add API Endpoints

Location: `src/libs/api/endpoints.ts`

```typescript
static entityName(uuid: string) {
  return `api/v2/resource/${uuid}`;
}
```

### Step 3: Create API Methods

Location: `src/libs/api/` (appropriate service file)

```typescript
getEntity(uuid: string) {
  return this.get<IEntity>(endpoints.entityName(uuid));
}

createEntity(data: IEntityCreate) {
  return this.post<IEntity, IEntityCreate>(endpoints.entities(), data);
}
```

### Step 4: Create React Query Hooks

Location: `src/app/hooks/query/`

```typescript
export const useEntity = (uuid: string) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.entity, uuid],
    queryFn: async () => await api.service.getEntity(uuid),
    enabled: !!uuid,
  });
};

export const useEntityCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: IEntityCreate) => api.service.createEntity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.entities] });
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Operation failed');
    },
  });
};
```

### Step 5: Add Query Keys

Location: `src/app/hooks/query/query-keys.ts`

```typescript
export const AucctusQueryKeys = {
  entities: 'entities',
  entity: 'entity',
} as const;
```

## Example: Complete Port

**Django Schema:**
```python
class CustomerProfileSchema(ModelSchema):
    jobs: List[CustomerJobSchema]
    age_range: str

    class Meta:
        model = CustomerProfile
        exclude = ["concept"]
```

**TypeScript Interface:**
```typescript
export interface ICustomerProfile {
  uuid: string;
  name: string;
  ageRange: string;
  jobs: ICustomerJob[];
}
```

**API Endpoint:**
```typescript
static customerProfiles(conceptUuid: string) {
  return `api/v2/concept/${conceptUuid}/customer-profile`;
}
```

**Hook:**
```typescript
export const useCustomerProfiles = (conceptUuid: string) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.customerProfiles, conceptUuid],
    queryFn: async () => await api.concept.getCustomerProfiles(conceptUuid),
    enabled: !!conceptUuid,
  });
};
```

## Additional Resources

For detailed patterns and examples, see:
- [REFERENCE.md](REFERENCE.md) - Complete conversion patterns with examples
