from flask import Flask, render_template, request, jsonify, redirect, url_for, session

app = Flask(__name__)
app.secret_key = "supersecretkey"  # Needed for session management

# Moderator password
MODERATOR_PASSWORD = "aibs25"

# Correct answers for the questions
correct_answers = {
    "q1": 48,
    "q2": 1480,
    "q3": 30.4,
    "q4": 85,
    "q5": 394,
    "q6": 12.5,
    "q7": 1538,
    "q8": 41,
    "q9": 296,
    "q10": 524,
}

# Track all submissions
all_submissions = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    global all_submissions
    results = {}
    correct_count = 0

    for question, correct_answer in correct_answers.items():
        try:
            lower_bound = float(request.form.get(f"{question}_lower", 0))
            upper_bound = float(request.form.get(f"{question}_upper", 0))

            if lower_bound <= correct_answer <= upper_bound:
                results[question] = {'status': 'Correct', 'correct_answer': correct_answer}
                correct_count += 1
            else:
                results[question] = {'status': 'Incorrect', 'correct_answer': correct_answer}

        except ValueError as e:
            results[question] = {'status': f"Error: {e}", 'correct_answer': None}

    all_submissions.append(correct_count)
    return jsonify(results=results, correct_count=correct_count)

@app.route('/moderator', methods=['GET', 'POST'])
def moderator():
    if session.get("authenticated"):
        return render_template('moderator.html')

    if request.method == 'POST':
        password = request.form.get("password")
        if password == MODERATOR_PASSWORD:
            session["authenticated"] = True
            return redirect(url_for("moderator"))

    return render_template('password.html')

@app.route('/moderator_data')
def moderator_data():
    if not session.get("authenticated"):
        return jsonify({"error": "Unauthorized"}), 403

    if len(all_submissions) > 0:
        average_correct = sum(all_submissions) / len(all_submissions)
    else:
        average_correct = 0

    return jsonify({
        "average_correct": round(average_correct, 2),
        "total_submissions": len(all_submissions)
    })

@app.route('/reset_data', methods=['POST'])
def reset_data():
    if not session.get("authenticated"):
        return jsonify({"error": "Unauthorized"}), 403

    global all_submissions
    all_submissions.clear()
    return jsonify({"message": "Database reset successful", "total_submissions": 0, "average_correct": 0})

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for("moderator"))

if __name__ == '__main__':
    app.run(debug=True)
