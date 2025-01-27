import { useState, useRef, useEffect } from "react";
import "../styles/Wordle.scss";
import Row from "./Row";
import Keyboard from "./Keyboard";
import { LETTERS, potentialWords } from "../data/lettersAndWords";

const SOLUTION = "manas";

console.log(SOLUTION);

export default function Wordle() {
  const [guesses, setGuesses] = useState([
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
  ]);
  const [solutionFound, setSolutionFound] = useState(false);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [notification, setNotification] = useState("");
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [failedGuesses, setFailedGuesses] = useState([]);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [presentLetters, setPresentLetters] = useState([]);
  const [absentLetters, setAbsentLetters] = useState([]);

  const wordleRef = useRef();

  useEffect(() => {
    wordleRef.current.focus();
  }, []);

  const typeLetter = (letter) => {
    if (activeLetterIndex < 5) {
      setNotification("");

      let newGuesses = [...guesses];
      newGuesses[activeRowIndex] = replaceCharacter(
        newGuesses[activeRowIndex],
        activeLetterIndex,
        letter
      );

      setGuesses(newGuesses);
      setActiveLetterIndex((index) => index + 1);
    }
  };

  const replaceCharacter = (string, index, replacement) => {
    return (
      string.slice(0, index) +
      replacement +
      string.slice(index + replacement.length)
    );
  };

  const hitEnter = () => {
    if (activeLetterIndex === 5) {
      const currentGuess = guesses[activeRowIndex];

      if (!potentialWords.includes(currentGuess)) {
        setNotification("NOT IN THE WORD LIST");
      } else if (failedGuesses.includes(currentGuess)) {
        setNotification("WORD TRIED ALREADY");
      } else if (currentGuess === SOLUTION) {
        setSolutionFound(true);
        setNotification("WELL DONE");
        setCorrectLetters([...SOLUTION]);
      } else {
        let correctLetters = [];
        let presentLettersSet = new Set();
        let absentLettersSet = new Set();

        const solutionLetters = [...SOLUTION];
        const guessLetters = [...currentGuess];

        // First pass: identify correct letters (matching positions)
        guessLetters.forEach((letter, index) => {
          if (solutionLetters[index] === letter) {
            correctLetters.push(letter);
            solutionLetters[index] = null; // Mark as used
          }
        });

        // Second pass: identify present letters (letters in the word but not in the same position)
        guessLetters.forEach((letter, index) => {
          if (
            solutionLetters.includes(letter) &&
            !correctLetters.includes(letter)
          ) {
            presentLettersSet.add(letter);
            solutionLetters[solutionLetters.indexOf(letter)] = null; // Mark as used
          } else if (
            !correctLetters.includes(letter) &&
            !presentLettersSet.has(letter)
          ) {
            absentLettersSet.add(letter);
          }
        });

        setCorrectLetters([...new Set(correctLetters)]);
        setPresentLetters([...presentLettersSet]);
        setAbsentLetters([...absentLettersSet]);

        setFailedGuesses([...failedGuesses, currentGuess]);

        // Check if it's the last attempt
        if (activeRowIndex === 5) {
          setNotification(`INCORRECT! NICE TRY!`);
        } else {
          setActiveRowIndex((index) => index + 1);
          setActiveLetterIndex(0);
        }
      }
    } else {
      setNotification("FIVE LETTER WORDS ONLY");
    }

    // Disable further actions after the last guess (if solution not found)
    if (activeRowIndex === 5 && !solutionFound) {
      setNotification("GAME OVER. NO MORE GUESSES.");
    }
  };

  const hitBackspace = () => {
    setNotification("");

    if (guesses[activeRowIndex][0] !== " " && activeRowIndex < 5) {
      const newGuesses = [...guesses];

      newGuesses[activeRowIndex] = replaceCharacter(
        newGuesses[activeRowIndex],
        activeLetterIndex - 1,
        " "
      );

      setGuesses(newGuesses);
      setActiveLetterIndex((index) => index - 1);
    }

    // Prevent any more backspace action if the game is over (after the last row)
    if (activeRowIndex === 5 && !solutionFound) {
      setNotification("GAME OVER. NO MORE GUESSES.");
    }
  };

  const handleKeyDown = (event) => {
    if (solutionFound) return;

    // Disable keyboard events if game is over (after last guess and not solved)
    if (activeRowIndex === 5 && !solutionFound) {
      setNotification("GAME OVER. NO MORE GUESSES.");
      return;
    }

    if (LETTERS.includes(event.key)) {
      typeLetter(event.key);
      return;
    }

    if (event.key === "Enter") {
      hitEnter();
      return;
    }

    if (event.key === "Backspace") {
      hitBackspace();
    }
  };

  return (
    <div
      className="wordle"
      ref={wordleRef}
      tabIndex="0"
      onBlur={(e) => {
        e.target.focus();
      }}
      onKeyDown={handleKeyDown}
    >
      <h1 className="title">
        TEDx <span>Wordle</span>
      </h1>
      <div className={`notification ${solutionFound && "notification--green"}`}>
        {notification}
      </div>
      {guesses.map((guess, index) => {
        return (
          <Row
            key={index}
            word={guess}
            applyRotation={
              activeRowIndex > index ||
              (solutionFound && activeRowIndex === index)
            }
            solution={SOLUTION}
            bounceOnError={
              notification !== "WELL DONE" &&
              notification !== "" &&
              activeRowIndex === index
            }
          />
        );
      })}
      <Keyboard
        presentLetters={presentLetters}
        correctLetters={correctLetters}
        absentLetters={absentLetters}
        typeLetter={typeLetter}
        hitEnter={hitEnter}
        hitBackspace={hitBackspace}
      />
    </div>
  );
}
