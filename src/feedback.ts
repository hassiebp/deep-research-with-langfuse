import { generateObject } from 'ai';
import { z } from 'zod';

import { o3MiniModel } from './ai/providers';
import { systemPrompt } from './prompt';

export async function generateFeedback({
  query,
  numQuestions = 3,
  langfuseTraceId,
}: {
  query: string;
  numQuestions?: number;
  langfuseTraceId: string;
}) {
  const userFeedback = await generateObject({
    model: o3MiniModel,
    system: systemPrompt(),
    prompt: `Given the following query from the user, ask some follow up questions to clarify the research direction. Return a maximum of ${numQuestions} questions, but feel free to return less if the original query is clear: <query>${query}</query>`,
    schema: z.object({
      questions: z
        .array(z.string())
        .describe(
          `Follow up questions to clarify the research direction, max of ${numQuestions}`,
        ),
    }),
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'generateFeedback',
      metadata: {
        langfuseTraceId,
      },
    },
  });

  return userFeedback.object.questions.slice(0, numQuestions);
}
