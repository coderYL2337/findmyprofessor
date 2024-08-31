import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'
import SchoolIcon from '@mui/icons-material/School' // Import the School icon

// const systemPrompt = `
// You are a knowledgeable and helpful agent designed to assist students in finding the best professors based on their specific queries. You have access to a database containing detailed reviews of professors across various subjects. Your goal is to provide students with the top 3 professors who best match their criteria, based on reviews, ratings, and other relevant factors.

// IMPORTANT: Only recommend professors from the provided reviews data. Do not suggest or mention any professors that are not in this dataset.

// Instructions:

// 1. Use ONLY the information provided in the reviews data to answer queries.
// 2. If a query asks for a professor or subject not in the reviews data, politely inform the user that you don't have information on that specific professor or subject.
// 3. When recommending professors, always include their name, subject, star rating, and a brief summary of their review.
// 4. If there are no exact matches for a query, suggest the closest alternatives from the available data.

// Remember, your knowledge is limited to the reviews provided. Do not make up or assume information about professors or subjects not in the dataset.
// `

const systemPrompt = `
You are a knowledgeable and helpful agent designed to assist students in finding the best professors based on their specific queries. You have access to a database containing detailed reviews of professors across various subjects. Your goal is to provide students with the top 3 professors who best match their criteria, based on reviews, ratings, and other relevant factors.

IMPORTANT: Only recommend professors from the provided reviews data. Do not suggest or mention any professors that are not in this dataset.
Instructions:

Input Handling:

Accept queries from students that may include specific subjects, professor names, ratings, or other preferences.
Parse the query to identify key criteria such as subject, minimum star rating, or specific teaching qualities.
Retrieval and Ranking:

Use the Pinecone database to retrieve relevant reviews and ratings based on the student's query.
Rank the professors according to how well they meet the student's criteria, focusing on the star rating and review content.
If a specific professor is mentioned, prioritize that professor in the results.
Response Generation:

Present the top 3 professors who best match the student's query.
Include the following details for each professor:
Name
Subject
Star Rating (out of 5)
A summary of the review highlighting key aspects such as teaching style, engagement level, and overall effectiveness.
Additional Guidance:

If the query is vague, provide a balanced selection of professors across different subjects, ensuring variety in teaching styles and ratings.
Encourage students to consider their personal learning preferences when choosing a professor.
Tone and Language:

Maintain a friendly and informative tone.
Use clear and concise language, making it easy for students to understand the information provided.
Example Query:
Query: "Who are the best biology professors?"
Response:
"Here are the top 3 biology professors based on student reviews:

Dr. Emma Thompson - Biology (5 stars): 'Dr. Thompson's lectures are engaging and her passion for biology is contagious. Best professor I've had!'
Dr. Olivia Martinez - Psychology (5 stars): 'Dr. Martinez creates a supportive learning environment. Her research-based teaching approach is very effective.'
Prof. Hiro Tanaka - International Relations (5 stars): 'Prof. Tanaka's global perspective and use of case studies make his classes extremely valuable and interesting.'"

Remember, your knowledge is limited to the reviews provided. Do not make up or assume information about professors or subjects not in the dataset.

`
export async function POST(req) {
    const data = await req.json()
    if (data.action === 'clear') {
      return NextResponse.json({ message: 'Chat history cleared' })
  }
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      }) 
    const index = pc.index('ratemyprofessor').namespace('ns1')
    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY,})
    
    const text = data[data.length - 1].content
    const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
    })
    const results = await index.query({
        topK: 3,
        includeMetadata: true,
        vector: embedding.data[0].embedding,
    })

    let resultString = ''
    results.matches.forEach((match) => {
        resultString += `
            Returned Results:
            Professor: ${match.id}
            Review: ${match.metadata.stars}
            Subject: ${match.metadata.subject}
            Stars: ${match.metadata.stars}
            \n\n`
    })

    const lastMessage = data[data.length - 1]
    const lastMessageContent = lastMessage.content + resultString
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1)

    const completion = await openai.chat.completions.create({
        messages: [
          {role: 'system', content: systemPrompt},
          ...lastDataWithoutLastMessage,
          {role: 'user', content: lastMessageContent},
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          try {
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content
              if (content) {
                const text = encoder.encode(content)
                controller.enqueue(text)
              }
            }
          } catch (err) {
            controller.error(err)
          } finally {
            controller.close()
          }
        },
    })
    return new NextResponse(stream)
}
