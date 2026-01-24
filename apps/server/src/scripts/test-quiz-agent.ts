import Agent from "../gen/agents/Agent";
import { QUIZ_STEP } from "../gen/state/quiz-agent.state";

export async function run() {
    const graph = await Agent.create_graph();

    // TURN 1: ask difficulty
    const state1 = await graph.invoke({
        step: QUIZ_STEP.ASK_DIFFICULTY,
        userId: "cmksif22d0000zxr6ken8turd",
        instruction: "Create a quiz on Operating Systems",
    });

    console.log("LLM says:");
    console.log(state1.streamingMessage);

    // simulate user response
    const userDifficulty = 3;

    // TURN 2: plan + generate
    const state2 = await graph.invoke({
        ...state1,              // preserve state
        step: QUIZ_STEP.PLANNING,
        difficulty: userDifficulty,
    });

    console.log("Final quiz:");
    console.dir(state2.quizData, { depth: null });
}


