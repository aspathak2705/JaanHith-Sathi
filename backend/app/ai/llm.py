import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()  #load env variables


class LLMService:
    def __init__(self):
        api_key = os.getenv("NVIDIA_API_KEY")

        if not api_key:
            raise ValueError("❌ NVIDIA_API_KEY not found in environment variables")

        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=api_key
        )

    def generate(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model="mistralai/mistral-nemotron",
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict and accurate government assistant."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=300,
            stream=False
        )

        return response.choices[0].message.content