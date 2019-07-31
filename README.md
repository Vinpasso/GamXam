# GamXam
Flashcard system for studying, currently contains some (more or less comprehensive) question catalogues for some lectures at the informatics deparment of the Technical University of Munich.

Go to [GamXam Github Page](https://vinpasso.github.io/GamXam/html/index.html) for the online version, use npm for the desktop version (electron). Use the dropdown to load a question catalogue from the repository.

### Available question catalogues
The current question catalogues available are

| Name | Code | Semester | Catalogue status |
| --- | --- | --- | --- |
| Advanced Topics of Software Engineering | IN2309, IN2126 | WS 18/19 | comprehensive |
| Parallel Programming | IN2147 | SS 19 | comprehensive |
| Parallel Programming Engineering | IN2310 | SS 19 | comprehensive |
| Secure Payment Networks | IN2161 | SS 19 | unknown |
| Test Question Catalogue | N/A | N/A | for testing |
| Virtualization Techniques | IN2125 | WS 18/19 | comprehensive, needs format update |

### Editing Question Catalogues
The schema can be found in [questions.xsd](https://github.com/Vinpasso/GamXam/blob/master/data/questions.xsd).
The recommended way of editing the question catalogue is using an IDE that supports autocompletion in XML Documents (such as IntelliJ). Question body and answer body can contain HTML tags.

### Contributing
Feel free to contact the authors or open a pull request for any of the existing catalogues or new catalogues, as well as for the system itself.