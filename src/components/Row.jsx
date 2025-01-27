import "../styles/Row.scss";

export default function Row({ word, applyRotation, solution, bounceOnError }) {
  // Track letters that have already been assigned to 'correct' or 'present'
  let solutionCount = {
    ...solution.split("").reduce((acc, letter) => {
      acc[letter] = (acc[letter] || 0) + 1;
      return acc;
    }, {}),
  };

  return (
    <div className={`row ${bounceOnError && "row--bounce"}`}>
      {word.split("").map((letter, index) => {
        // Track the current background class for the letter
        let bgClass = "absent"; // Default case: the letter is not in the solution

        if (solution[index] === letter) {
          // Correct letter at the correct position
          bgClass = "correct";

          // Reduce the count for this letter in the solution since it's matched
          solutionCount[letter]--;
        } else if (solution.includes(letter) && solutionCount[letter] > 0) {
          // If the letter is present in the solution and there's still an available occurrence
          bgClass = "present";

          // Reduce the count for this letter in the solution since it's been used
          solutionCount[letter]--;
        }

        return (
          <div
            className={`letter ${bgClass} ${
              applyRotation && `rotate--${index + 1}00`
            } ${letter !== " " && "letter--active"}`}
            key={index}
          >
            {letter}
            <div className="back">{letter}</div>
          </div>
        );
      })}
    </div>
  );
}
