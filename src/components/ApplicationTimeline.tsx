import type { ApplicationStatus } from '@/generated/prisma/enums';
import { APPLICATION_STATUS_LABELS, PIPELINE, pipelineIndex } from '@/lib/applications';
import { formatDate } from '@/lib/format';

type TimelineEvent = {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  note: string | null;
  createdAt: Date;
};

/**
 * The revision table — the product's whole promise, rendered as the drafting
 * convention it already is: an append-only, dated, signed record of every
 * change, never overwritten.
 *
 * Above it, a stage rule showing how far along the sheet has been taken.
 */
export function ApplicationTimeline({
  status,
  events,
  animate = false,
}: {
  status: ApplicationStatus;
  events: TimelineEvent[];
  /** Only the most recently updated application animates its markup rule. */
  animate?: boolean;
}) {
  const rejected = status === 'REJECTED';
  const withdrawn = status === 'WITHDRAWN';
  const closed = rejected || withdrawn;

  // A closed application still shows how far it got, taken from its own history.
  const reachedIndex = closed
    ? Math.max(...events.map((event) => pipelineIndex(event.toStatus)), pipelineIndex('APPLIED'))
    : pipelineIndex(status);

  // Oldest first: a revision table reads down the page in issue order.
  const ordered = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div>
      {/* Stage rule */}
      <ol className="flex border border-rule">
        {PIPELINE.map((stage, index) => {
          const reached = index <= reachedIndex;
          const current = index === reachedIndex && !closed;

          return (
            <li
              key={stage}
              className={`min-w-0 flex-1 px-2 py-2 ${index > 0 ? 'border-l border-rule' : ''} ${
                current ? 'bg-markup-wash' : reached ? 'bg-paper' : ''
              }`}
            >
              {/* Unreached stages stay at full ink-3: they are informational
                  stage names, not decoration. The rule beneath carries the
                  "not reached" signal instead of low contrast. */}
              <span
                className={`lettering block truncate ${
                  current ? 'text-markup-ink' : reached ? 'text-ink-2' : 'text-ink-3'
                }`}
              >
                {APPLICATION_STATUS_LABELS[stage]}
              </span>
              {/* The authored moment: the markup rule draws in under the
                  current stage, the way a revision is clouded on a drawing. */}
              <span
                aria-hidden="true"
                className={`mt-1.5 block h-0.5 ${
                  current
                    ? `${animate ? 'markup-rule' : ''} bg-markup`
                    : reached
                      ? 'bg-ink-3/40'
                      : 'bg-rule-soft'
                }`}
              />
            </li>
          );
        })}
      </ol>

      {closed && (
        <p
          className={`data mt-3 border px-3 py-2 ${
            rejected
              ? 'border-rule bg-paper text-ink-2'
              : 'border-rule bg-paper text-ink-3'
          }`}
        >
          {rejected
            ? 'The employer decided not to move forward with this application.'
            : 'You withdrew this application.'}
        </p>
      )}

      {/* Revision table */}
      <table className="mt-5 w-full">
        <caption className="lettering mb-2 text-left text-ink-3">
          Revision history ({ordered.length})
        </caption>
        <thead>
          <tr className="border-b-2 border-ink">
            <th scope="col" className="lettering py-2 pr-3 text-left text-ink-3">
              Rev
            </th>
            <th scope="col" className="lettering py-2 pr-3 text-left text-ink-3">
              Date
            </th>
            <th scope="col" className="lettering py-2 pr-3 text-left text-ink-3">
              Change
            </th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((event, index) => {
            const isLast = index === ordered.length - 1;
            return (
              <tr
                key={event.id}
                className={`border-b border-rule-soft last:border-b-0 ${
                  isLast && !closed ? 'border-l-2 border-l-markup bg-markup-wash' : ''
                } ${closed && isLast ? 'hatched' : ''}`}
              >
                <td className="py-2.5 pl-2 pr-3 align-top">
                  {/* The revision triangle — how a drafting revision is flagged
                      at the changed item. */}
                  <span
                    className={`rev-triangle ${
                      isLast && !closed ? 'bg-markup text-ink' : 'bg-ink-3/25 text-ink'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                </td>
                <td className="data py-2.5 pr-3 align-top whitespace-nowrap">
                  {formatDate(event.createdAt)}
                </td>
                <td className="data py-2.5 align-top">
                  <span className={isLast && !closed ? 'font-semibold text-markup-ink' : ''}>
                    {event.fromStatus
                      ? `${APPLICATION_STATUS_LABELS[event.fromStatus]} → ${
                          APPLICATION_STATUS_LABELS[event.toStatus]
                        }`
                      : 'Application submitted'}
                  </span>
                  {event.note && <span className="mt-1 block text-ink-3">{event.note}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
