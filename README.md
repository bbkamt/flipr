# flipr
A flashcard web application based on the idea of spaced-repetition that allows you to create and review decks of flashcards. 

flipr has a custom method that allows you to grade how well they know the material when reviewing the cards, and then uses this information to determine when to show you the cards again.

It also incorporates two methods of study that have shown to improve recall across several studies: Multiple choice, and delayed review. With multiple choice will use information from other cards in your decks to generate multiple options, and with delayed review, flipr will delay showing you the reverse of each card until a later point, when you can review everything and grade them in bulk. 

This is an ongoing project, with new features and updated designs still to come!

## Technology 
flipr is being developed using: 
* Node.js 
* MongoDB - mongoose 
* Express 
* Passport 
* Pug (for HTML)
* CSS 

### Installation 
Use the Node Package Manager to install the relevant modules 
```
npm install 
```
flipr can then run as a local site: 
```
node index.js 
```
And you can access the pages at localhost:3000 





