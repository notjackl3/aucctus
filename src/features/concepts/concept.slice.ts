import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IConceptResponse } from "../../libs/api/typings/ignite-concepts";
import { RootState } from "../../app/store";
import analytics from "../../libs/analytics";
import api from "../../libs/api";

export interface ConceptState {
  selectedConcept?: string
  igniteId?: string
  // Fresh Concepts from ignite
  concepts: IConceptResponse[]
  status: "idle" | "loading" | "failed",

}


const initialState: ConceptState = {
  status: "idle",
  selectedConcept: undefined,
  concepts: [],
}

export const saveConcept = createAsyncThunk(
  "concept/save",
  async (id: string, thunkApi) => {
    analytics.debug('Save')
    try {
      const response = await api.igniteConcept.saveGeneratedConcept(id)
      return response
    } catch (e) {
      analytics.debug(e)
      thunkApi.rejectWithValue(e)
    }
  },
)


export const removedUnsavedConcepts = createAsyncThunk(
  'concept/remove-unsaved',
  async (id: string, thunkApi) => {
    analytics.debug('Remove Unsaved')
    try {
      return await api.igniteConcept.deleteAllUnsavedGeneratedConcept(id)
    } catch (e) {
      analytics.debug(e)
      thunkApi.rejectWithValue(e)
    }
  }
)

export const conceptSlice = createSlice({
  name: "concept",
  initialState,
  reducers: {
    setConcepts(state, action: PayloadAction<IConceptResponse[]>) {
      analytics.debug(action.payload)
      state.concepts = action.payload
      const firstConcept = action.payload[0]
      if (firstConcept) {
        state.igniteId = firstConcept.igniteConceptId
      }

    },
    setSelectedConcept(state, action: PayloadAction<string>) {
      state.selectedConcept = action.payload
    }
  },
  extraReducers: (builder) => {
    // TODO: Handle errors
    builder
      .addCase(saveConcept.fulfilled, (state, action) => {
        if (action.payload !== undefined) {
          state.concepts = state.concepts.map(c => c.id === action.payload.id ? action.payload : c)
          state.igniteId = action.payload.igniteConceptId
        }
      })
      .addCase(saveConcept.pending, (state) => {

      })
      .addCase(saveConcept.rejected, (state) => {

      })
      .addCase(removedUnsavedConcepts.fulfilled, (state, action) => {
        state.concepts = []
        state.igniteId = undefined
      })
  }
})

export const { setConcepts, setSelectedConcept } = conceptSlice.actions

export const selectConceptList = (state: RootState) => state.concepts.concepts
export const selectedConcept = (state: RootState) => state.concepts.selectedConcept
export const selectIgniteConceptId = (state: RootState) => state.concepts.igniteId

export default conceptSlice.reducer;