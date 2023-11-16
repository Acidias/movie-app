import * as React from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "./firebaseConfig";
import { ref, set, push, child, getDatabase } from "firebase/database";

import Button from "@mui/material/Button";
import GoogleIcon from "@mui/icons-material/Google";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import "./Login.css";
import GitHubIcon from "@mui/icons-material/GitHub";

const userCollection = async (user) => {
   const db = getDatabase();
   const usersRef = ref(db, "users/" + user.uid);
   try {
      await set(usersRef, {
         name: user.displayName,
         email: user.email,
         photo: user.photoURL,
         apiUsage: 0,
         createdAt: new Date().toISOString(),
      });
      console.log("User data saved");
   } catch (error) {
      console.error("Error adding document: ", error);
   }
};

const Login = () => {
   const navigator = useNavigate();

   const handleGoogleSignIn = () => {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();

      signInWithPopup(auth, provider)
         .then(async (result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            await userCollection(user);
            console.log("User signed in: ", user);
            navigator("/");
         })
         .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            console.error("Error signing in: ", errorMessage);
         });
   };

   return (
      <Container component="main" maxWidth="xs" className="login-container">
         <Box
            sx={{
               marginTop: 8,
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
            }}
         >
            <Typography component="h1" variant="h5">
               Sign in
            </Typography>
            <Button
               variant="contained"
               startIcon={<GoogleIcon />}
               onClick={handleGoogleSignIn}
               sx={{ mt: 3, mb: 2 }}
            >
               Register with Google
            </Button>
            <Typography
               variant="body1"
               sx={{
                  mt: 2,
                  textAlign: "center",
                  color: "red",
                  fontWeight: "bold",
               }}
            >
               Not phone friendly yet. Please use a desktop browser.
               Registration required for API usage.
            </Typography>
            <Typography
               variant="body1"
               sx={{ mt: 2, textAlign: "center", color: "white" }}
            >
               This application is a demonstration project for a university
               course. It showcases functionalities like movie search, detail
               retrieval, analysing movie sentiment, and chatbot interactions
               using OpenAI's API. The system is currently in a trial phase with
               limited features. The chatbot is to expriment with function
               calling with OpenAI's API. The chatbot is not a fully functional
               chatbot. It is a demonstration of the API's capabilities.
            </Typography>

            <Button
               variant="contained"
               startIcon={<GitHubIcon />}
               sx={{ mt: 3, mb: 2 }}
               href="https://github.com/Acidias/movie-app"
               target="_blank"
            >
               View on GitHub
            </Button>
         </Box>
      </Container>
   );
};

export default Login;
