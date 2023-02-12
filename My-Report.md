 # Report
 
 Movie App that allows users to search for movies and view the details of a selected movie. 
 The project is built using React, a JavaScript library for building user interfaces, 
 and it makes use of the OpenAI API to generate a story about the selected movie.

The project consists of three main components: App.js, Movie.js and MovieProfile.js.

In the App.js component, the state of the application is managed using React's useState hook. 
The state variables are movies, searchValue and selectedMovie. The component makes a fetch request 
to the OMDb API to retrieve movie data based on the search query entered by the user. 
The component also contains a search bar that allows users to search for movies and a grid of movie cards 
that displays the search results. Each movie card is a component of its own and is created using the Movie component.

The Movie component is responsible for displaying a single movie card. It receives the movie data as a prop and 
displays the movie's poster, year, and title. The component also sets the state of selectedMovie to true when the 
movie card is clicked, which triggers the display of the MovieProfile component.

The MovieProfile component is a modal that displays detailed information about the selected movie. 
This component makes a request to the OpenAI API to generate a story about the selected movie. 
The story is displayed in the modal along with the movie's poster and title. The component also contains a close button 
that allows the user to close the modal.

In conclusion, the project is a simple movie app that demonstrates the use of React and the OpenAI API. 
The project makes use of functional components, state management with the useState hook, 
and API calls to display movie data and generate a story about the selected movie.

# Learning Outcomes

### With creating this project, I learned the following:

-The basics of React components and how to use them to build a user interface.

-How to use React Hooks, such as useState and useEffect, to manage state and handle side effects in my components.

-The process of making API calls to a RESTful API and retrieving data, as well as parsing the response data.

-How to integrate and use external libraries, such as axios and react-spinners, in my React project.

-The basics of styling my components using CSS in React to create a visually appealing user interface.

-How to use the OpenAI API to generate text based on a prompt, which added another layer of functionality to my project.

-The importance of version control and how to use Git to manage my code and collaborate with others on a project.

-The benefits of modular programming and how to break down my code into smaller, reusable components, making my code more organized and maintainable.

-The concept of conditional rendering in React and how to conditionally render components based on specific conditions.

-The importance of error handling and how to handle errors and exceptions that may occur during the development and deployment of my project.

