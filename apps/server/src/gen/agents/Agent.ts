import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Response } from "express";


export default class Agent {

    private model: ChatGoogleGenerativeAI;

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            model: 'gemini-2.5-flash',
            temperature: 0.2,
        });
    }

    public async create_new_question(
        instruction: string,
    ) {
        try {
            
        } catch (error) {
            
        }
    }

    public create_stream(res: Response): void {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
    }

}