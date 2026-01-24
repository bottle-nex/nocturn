import Agent from "../gen/agents/Agent";
import { QUIZ_STEP } from "../gen/state/quiz-agent.state";

export async function run() {
    const graph = await Agent.create_graph();

    const initialState = {
        step: QUIZ_STEP.ASK_DIFFICULTY,
        userId: "cmksif22d0000zxr6ken8turd",
        instruction: "Create a quiz on Operating Systems",
        streamingMessage: "",
        revisionFeedback: null,
    };

    console.log("Starting agent...");

    const result = await graph.invoke(initialState);

    console.log("Final state:");
    console.dir(result, { depth: null });
}

