import dspy
# import mlflow

# try:
#     mlflow.set_tracking_uri("http://localhost:5000")
#     mlflow.set_experiment("AI Launcher")
#     mlflow.autolog()
# except Exception as error:
#     print(error)

lm = dspy.LM("gemini/gemini-2.5-flash", api_key="AIzaSyABydghd9XApbXSe8MvB6y2YRckJHLTn-Q", temperature=0.5)
dspy.configure(lm=lm)



# Lets add a system Prompt Description to a Signature
class ConciseAnswer(dspy.Signature):
    """Provide a short and concise response highlighting only the important information without any extra fluffs. Consider each work as an expense so try to limit the work count to minimal."""

    question = dspy.InputField()
    answer = dspy.OutputField()

 ## Define input and output of the system (simple QA)
qa = dspy.Predict(ConciseAnswer)

def ask(question: str):
    response = qa(question=question)
    answer = response.answer
    return answer
