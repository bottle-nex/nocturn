'use client';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useCollaborativeEdit } from '@/hooks/useCollaborativeEdit';
import { AnswerConfig, QUESTION_TYPES, QuestionKind } from '@nocturn/types';

const labels: Record<QuestionKind, string> = {
    MULTIPLE_CHOICE: 'Multiple choice',
    TRUE_FALSE: 'True or false',
    MULTI_SELECT: 'Pick all that apply',
    SHORT_ANSWER: 'Type the answer',
    ORDERING: 'Put in order',
    NUMERIC: 'Number guess',
};

export default function Options() {
    const { quiz, currentQuestionIndex } = useNewQuizStore();
    const { editQuestionAndBroadcast } = useCollaborativeEdit();
    const q = quiz.questions[currentQuestionIndex];
    if (!q) return null;
    const type = q.questionType ?? 'MULTIPLE_CHOICE';
    const config = q.answerConfig ?? {};
    const edit = (fields: Partial<typeof q>) =>
        editQuestionAndBroadcast(currentQuestionIndex, { ...fields, id: q.id });
    const configure = (fields: Partial<AnswerConfig>) =>
        edit({ answerConfig: { ...config, ...fields } });
    function switchType(next: QuestionKind) {
        const options =
            next === 'TRUE_FALSE'
                ? ['True', 'False']
                : next === 'SHORT_ANSWER' || next === 'NUMERIC'
                  ? []
                  : q.options.length >= 2
                    ? q.options
                    : ['', ''];
        const answerConfig: AnswerConfig =
            next === 'MULTI_SELECT'
                ? { correctIndices: [0] }
                : next === 'SHORT_ANSWER'
                  ? { acceptedAnswers: [''] }
                  : next === 'ORDERING'
                    ? { correctOrder: options.map((_, i) => i) }
                    : next === 'NUMERIC'
                      ? { min: 0, max: 100, target: 50, tolerance: 50 }
                      : {};
        edit({ questionType: next, options, correctAnswer: 0, answerConfig });
    }
    const inputClass = 'w-full rounded border p-2 bg-transparent';
    return (
        <div className="w-full flex flex-col gap-3">
            <label>
                Question type
                <select
                    className={inputClass}
                    value={type}
                    onChange={(e) => switchType(e.target.value as QuestionKind)}
                >
                    {QUESTION_TYPES.map((t) => (
                        <option key={t} value={t}>
                            {labels[t]}
                        </option>
                    ))}
                </select>
            </label>
            {type === 'SHORT_ANSWER' ? (
                <label>
                    Accepted answers (one per line; case and extra spaces are ignored)
                    <textarea
                        className={inputClass}
                        value={(config.acceptedAnswers ?? []).join('\n')}
                        maxLength={4000}
                        onChange={(e) => configure({ acceptedAnswers: e.target.value.split('\n') })}
                    />
                </label>
            ) : type === 'NUMERIC' ? (
                <>
                    {(['min', 'max', 'target', 'tolerance'] as const).map((field) => (
                        <label key={field}>
                            {
                                {
                                    min: 'Slider minimum',
                                    max: 'Slider maximum',
                                    target: 'Exact answer',
                                    tolerance: 'Distance from the answer where points reach zero',
                                }[field]
                            }
                            <input
                                className={inputClass}
                                type="number"
                                step="any"
                                value={config[field] ?? ''}
                                onChange={(e) =>
                                    configure({
                                        [field]:
                                            e.target.value === ''
                                                ? undefined
                                                : Number(e.target.value),
                                    })
                                }
                            />
                        </label>
                    ))}
                </>
            ) : (
                <>
                    <p>
                        {type === 'ORDERING'
                            ? 'Enter items, then choose the correct sequence below.'
                            : type === 'MULTI_SELECT'
                              ? 'Check every correct option.'
                              : 'Select the correct answer.'}
                    </p>
                    {q.options.map((option, index) => (
                        <div className="flex items-center gap-3" key={index}>
                            {type !== 'ORDERING' && (
                                <input
                                    aria-label={`Correct option ${index + 1}`}
                                    type={type === 'MULTI_SELECT' ? 'checkbox' : 'radio'}
                                    name="correct-answer"
                                    checked={
                                        type === 'MULTI_SELECT'
                                            ? (config.correctIndices?.includes(index) ?? false)
                                            : q.correctAnswer === index
                                    }
                                    onChange={() =>
                                        type === 'MULTI_SELECT'
                                            ? configure({
                                                  correctIndices: config.correctIndices?.includes(
                                                      index,
                                                  )
                                                      ? config.correctIndices.filter(
                                                            (i) => i !== index,
                                                        )
                                                      : [...(config.correctIndices ?? []), index],
                                              })
                                            : edit({ correctAnswer: index })
                                    }
                                />
                            )}
                            <input
                                aria-label={`Option ${index + 1}`}
                                className={inputClass}
                                value={option}
                                disabled={type === 'TRUE_FALSE'}
                                onChange={(e) =>
                                    edit({
                                        options: q.options.map((v, i) =>
                                            i === index ? e.target.value : v,
                                        ),
                                    })
                                }
                            />
                            {type !== 'TRUE_FALSE' && (
                                <button
                                    type="button"
                                    disabled={q.options.length <= 2}
                                    aria-label={`Remove option ${index + 1}`}
                                    onClick={() => {
                                        const options = q.options.filter((_, i) => i !== index);
                                        const remap = (xs: number[]) =>
                                            xs
                                                .filter((i) => i !== index)
                                                .map((i) => (i > index ? i - 1 : i));
                                        edit({
                                            options,
                                            correctAnswer:
                                                q.correctAnswer === index
                                                    ? 0
                                                    : q.correctAnswer > index
                                                      ? q.correctAnswer - 1
                                                      : q.correctAnswer,
                                            answerConfig: {
                                                ...config,
                                                ...(type === 'MULTI_SELECT'
                                                    ? {
                                                          correctIndices: remap(
                                                              config.correctIndices ?? [],
                                                          ),
                                                      }
                                                    : type === 'ORDERING'
                                                      ? {
                                                            correctOrder: remap(
                                                                config.correctOrder ?? [],
                                                            ),
                                                        }
                                                      : {}),
                                            },
                                        });
                                    }}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    {type !== 'TRUE_FALSE' && (
                        <button
                            type="button"
                            disabled={q.options.length >= 6}
                            onClick={() =>
                                edit({
                                    options: [...q.options, ''],
                                    ...(type === 'ORDERING'
                                        ? {
                                              answerConfig: {
                                                  correctOrder: [
                                                      ...(config.correctOrder ?? []),
                                                      q.options.length,
                                                  ],
                                              },
                                          }
                                        : {}),
                                })
                            }
                        >
                            Add option
                        </button>
                    )}
                    {type === 'ORDERING' && (
                        <div>
                            <p>Correct sequence</p>
                            {(config.correctOrder ?? q.options.map((_, i) => i)).map(
                                (item, position, order) => (
                                    <label className="block" key={position}>
                                        {position + 1}.
                                        <select
                                            className={inputClass}
                                            value={item}
                                            onChange={(e) => {
                                                const selected = Number(e.target.value);
                                                const next = [...order];
                                                const other = next.indexOf(selected);
                                                next[position] = selected;
                                                if (other !== -1) next[other] = item;
                                                configure({ correctOrder: next });
                                            }}
                                        >
                                            {q.options.map((v, i) => (
                                                <option key={i} value={i}>
                                                    {v || `Item ${i + 1}`}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                ),
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
