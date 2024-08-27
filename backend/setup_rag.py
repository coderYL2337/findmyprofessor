from dotenv import load_dotenv
load_dotenv()
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI
import os
import json

# Initializes Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

index_name = 'ratemyprof-hf'

# check if the hf-endpoints index exists
if index_name not in pc.list_indexes():
    # create the index if it does not exist
    pc.create_index(
        index_name,
        dimension=1024,
        metric="cosine"
    )

data = json.load(open("reviews.json"))

processed_data = []
client = OpenAI(os.getenv("OPENAI_API_KEY"),
)

# Creates the embeddings for each review
for review in data["reviews"]:
    response = client.embeddings.create(
        input = review['review'], model=""
    )
    embedding = response.data[0].embedding
    processed_data.append(
        {
            "value": embedding,
            "id": review["professor"],
            "metadata": {
                "professor": review["professor"],
                "course": review["subject"],
                "rating": review["rating"],
            }
        }
    )
    
index = pc.Index("ratemyprofvector")
upsert_response = index.upsert(
    vectors=processed_data,
    namespace="ns1",
)
print(f"Upserted count: {upsert_response['upserted_count']}")

# Print index statistics
print(index.describe_index_stats())
