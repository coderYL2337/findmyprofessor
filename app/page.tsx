'use client'

import React, { useState, useEffect } from 'react'
import { Box, Button, TextField, Stack, Typography, Container, Grid } from '@mui/material'
import ProfessorReviews from './components/ProfessorReviews'
import SchoolIcon from '@mui/icons-material/School' 
import styles from './page.module.css'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your Rate My Prof AI assistant. How can I help you today?'
    },
  ])
  const [message, setMessage] = useState('')
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    // Fetch reviews data
    fetch('/api/reviews')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data:', data); // Add this line for debugging
        setReviews(data.reviews || []); // Use empty array as fallback
      })
      .catch(error => console.error('Error fetching reviews:', error))
  }, [])

  const sendMessage = async () => {
    setMessage('')
    setMessages((prevMessages) => [
      ...prevMessages, 
      { role: 'user', content: message },
      {role: 'assistant', content: ''},
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([ ...messages, { role: 'user', content: message }]),
      });

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value, { stream: true });
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          return [
            ...prevMessages.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: 'Sorry, an error occurred. Please try again.' },
      ]);
    }
  }

  const clearChat = async () => {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'clear' })
      });
      setMessages([
        {
          role: 'assistant',
          content: 'Chat history has been cleared. How can I assist you?'
        },
      ]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  }
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box className={styles.titleContainer}>
        <SchoolIcon className={styles.titleIcon} />
        <Typography variant="h2" align="center" gutterBottom className={styles.cuteTitle}>
          Find My Professor
        </Typography>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box
            width="100%"
            height="700px"
            display="flex"
            flexDirection="column"
            bgcolor={'white'}
            border="1px solid black"
            p={2}
          >
            <Stack
              direction={'column'}
              width="100%"
              height="100%"
              spacing={3}
            >
              <Stack
                direction={'column'}
                spacing={2}
                flexGrow={1}
                overflow="auto"
                maxHeight="100%"
              >
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent={
                      message.role === 'assistant' ? 'flex-start' : 'flex-end'
                    }
                  >
                    <Box
                      bgcolor={
                        message.role === 'assistant'
                          ? 'primary.main'
                          : 'secondary.main'
                      }
                      color="white"
                      borderRadius={16}
                      p={3}
                    >
                      {message.content}
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Stack direction={'row'} spacing={2}>
                <TextField
                  label="Message"
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button variant="contained" onClick={sendMessage}>
                  Send
                </Button>
              </Stack>
              <Button variant="outlined" onClick={clearChat} color="secondary">
                Clear Chat
              </Button>
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
         <Box className={styles.reviewsColumn}>
            <Typography variant="h4" className={styles.reviewsTitle}>
              Professor Reviews ({reviews.length})
            </Typography>
            <ProfessorReviews reviews={reviews} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

// 'use client'

// import React from 'react'
// import { useState } from 'react'
// import { Box, Button, TextField, Stack } from '@mui/material'

// export default function Home() {
//   const [messages, setMessages] = useState([
//     {
//       role: 'assistant',
//       content: 'Hello! I am your Rate My Prof AI assistant. How can I help you today?'
//     },
//   ])
//   const [message, setMessage] = useState('')
//   const sendMessage = async () => {
//     setMessage('')
//     setMessages((messages) => [
//       ...messages, 
//       { role: 'user', content: message },
//       {role: 'assistant', content:''},
//     ])

//     const response = fetch('/api/chat', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify([ ...messages, { role: 'user', content: message }]),
//     }).then(async(res) => {
//       if (!res.body) {
//         throw new Error('Response body is null');
//       }
//       const reader = res.body.getReader()
//       const decoder = new TextDecoder()
//       let result = ''

//       return reader.read().then(function processText({ done, value }) {
//         if (done) {
//           return result
//         }
//         const text = decoder.decode(value || new Uint8Array(), {stream: true})
//         setMessages((messages) => {
//           let lastMessage = messages[messages.length - 1]
//           let otherMessages = messages.slice(0, messages.length - 1)
//           return[
//             ...otherMessages,
//             {...lastMessage, content: lastMessage.content + text},
//           ]
//         })
//         return reader.read().then(processText)
//       }) 
//     })
//   }
//   return(
//     <Box
//     width="100vw"
//     height="100vh"
//     display="flex"
//     flexDirection="column"
//     justifyContent="center"
//     alignItems="center"
//     bgcolor={'white'}
//   >
//     <Stack
//       direction={'column'}
//       width="500px"
//       height="700px"
//       border="1px solid black"
//       p={2}
//       spacing={3}
//     >
//       <Stack
//         direction={'column'}
//         spacing={2}
//         flexGrow={1}
//         overflow="auto"
//         maxHeight="100%"
//       >
//         {messages.map((message, index) => (
//           <Box
//             key={index}
//             display="flex"
//             justifyContent={
//               message.role === 'assistant' ? 'flex-start' : 'flex-end'
//             }
//           >
//             <Box
//               bgcolor={
//                 message.role === 'assistant'
//                   ? 'primary.main'
//                   : 'secondary.main'
//               }
//               color="white"
//               borderRadius={16}
//               p={3}
//             >
//               {message.content}
//             </Box>
//           </Box>
//         ))}
//       </Stack>
//       <Stack direction={'row'} spacing={2}>
//         <TextField
//           label="Message"
//           fullWidth
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//         />
//         <Button variant="contained" onClick={sendMessage}>
//           Send
//         </Button>
//       </Stack>
//     </Stack>
//   </Box>
//   )
// }