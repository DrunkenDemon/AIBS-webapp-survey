document.getElementById('range-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(this);
    const submitButton = document.getElementById('submit-btn');
    const questions = 10; // Number of questions in the form
    let hasErrors = false; // Track if there are validation errors

    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach((el) => el.remove());

    // Validation: Check if "lower bound" <= "upper bound" for each question
    for (let i = 1; i <= questions; i++) {
        const lowerInput = document.getElementById(`q${i}_lower`);
        const upperInput = document.getElementById(`q${i}_upper`);

        const lowerValue = parseFloat(lowerInput.value);
        const upperValue = parseFloat(upperInput.value);

        if (lowerValue > upperValue) {
            // Add an error message below the question
            const errorMessage = document.createElement('p');
            errorMessage.textContent = `Error: Lower Bound must be less than or equal to Upper Bound for Question ${i}.`;
            errorMessage.className = 'error-message';
            lowerInput.parentElement.insertAdjacentElement('afterend', errorMessage);

            hasErrors = true;
        }
    }

    // If validation fails, stop form submission and re-enable the submit button
    if (hasErrors) {
        alert('Please fix the errors before submitting.');
        return;
    }

    try {
        // Disable the submit button immediately to prevent multiple submissions
        submitButton.disabled = true;

        // Send form data to the backend
        const response = await fetch('/submit', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Display results
        const results = data.results;
        for (const [question, result] of Object.entries(results)) {
            // Display "Correct" or "Incorrect"
            const resultText = document.createElement('p');
            resultText.textContent = result.status;
            resultText.className = result.status === 'Correct' ? 'correct' : 'incorrect';
            document.getElementById(`${question}_result`).appendChild(resultText);

            // Display the correct answer
            const correctAnswerText = document.createElement('p');
            correctAnswerText.textContent = `Correct Answer: ${result.correct_answer}`;
            document.getElementById(`${question}_answer`).appendChild(correctAnswerText);

            // Disable input fields
            document.getElementById(`${question}_lower`).disabled = true;
            document.getElementById(`${question}_upper`).disabled = true;
        }

        // Display summary
        const summaryDiv = document.getElementById('summary');
        summaryDiv.textContent = `You got ${data.correct_count} out of 10 questions correct!`;
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while submitting the form. Please try again.');
    }
    
});
