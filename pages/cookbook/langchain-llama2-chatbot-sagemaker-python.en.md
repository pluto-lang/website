# Building a Llama2 Conversational Chatbot with AWS and LangChain

The difference between this and the[TypeScript version of the Pluto example](https://github.com/pluto-lang/pluto/tree/main/examples/langchain-llama2-chatbot-sagemaker-python/../langchain-llama2-chatbot-sagemaker/) lies in its implementation in Python.

After deployment, the initial execution might time out. The problem we've found is that importing LangChain is taking too long, approximately 50 seconds, even with .pyc files present. However, once the import is done, subsequent executions run smoothly.
