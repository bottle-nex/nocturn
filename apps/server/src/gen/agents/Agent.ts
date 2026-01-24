import { chain } from "../../services/init.services";
import { QUIZ_STEP, QuizAgentState } from "../state/quiz-agent.state";


export default class Agent {

    static async ask_difficulty_node(
        state: QuizAgentState,
    ): Promise<QuizAgentState> {
        const { difficulty_asker } = chain.get_chain();

        const response = await difficulty_asker.invoke({
            instruction: state.instruction,
        });

        return {
            ...state,
            step: QUIZ_STEP.WAIT_DIFFICULTY,
            streamingMessage: response.userResponse,
        };
    }

    // static async generate_quiz_node(
    //     state: QuizAgentState,
    // ): Promise<QuizAgentState> {

    //     const { planner, executor } = chain.get_chain();



    // }
    
}