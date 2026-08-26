from pydantic import BaseModel


class ScenarioSummary(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True


class ScenarioDetail(BaseModel):
    id: int
    title: str
    narrative: str
    choice_a: str
    choice_b: str

    class Config:
        from_attributes = True


class ScenarioAnswerRequest(BaseModel):
    choice: str  # "a" or "b"


class ScenarioAnswerResponse(BaseModel):
    scenario_id: int
    selected_choice: str
    is_correct: bool
    correct_choice: str
    explanation: str

    class Config:
        from_attributes = True
