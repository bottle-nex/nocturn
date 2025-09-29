import Bull from "bull";
import TransitionWorker from "../job/transition-worker";
import { transitionWorkerInstance } from "../services/init-services";
import { PhaseTransitionJob } from "../types/types";
import dotenv from "dotenv";
import { Env } from "../configs/env";

export default class PhaseQueueProcessor {
  private phase_queue: Bull.Queue;
  private transition_worker: TransitionWorker;

  constructor() {
    this.phase_queue = new Bull("phase-transitions", {
      redis: Env.ORCH_REDIS_URL,
    });
    this.transition_worker = transitionWorkerInstance;
    this.start_consuming();
  }

  private start_consuming() {
    this.phase_queue.process("phase_transition", async (job) => {
      this.transition_worker.handle_transition_phase(job.data);
    });
  }

  public async schedule_phase_transition(
    data: PhaseTransitionJob,
  ): Promise<void> {
    const delay = Math.max(0, data.executeAt - Date.now());
    try {
      await this.phase_queue.add("phase_transition", data, {
        delay,
        jobId: `${data.gameSessionId}_${data.questionIndex}_${data.fromPhase}_${data.toPhase}`,
      });
    } catch (error) {
      console.error(`Failed to schedule phase transition:`, error);
    }
  }

  public set_transition_worker(transition_worker: TransitionWorker) {
    this.transition_worker = transition_worker;
  }
}
