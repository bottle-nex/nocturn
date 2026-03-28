import LiveEditingCardComponent from './LiveEditingCardComponent';
import SolanaFeatureCardComponent from './SolanaFeatureCardComponent';
import WorkflowCardComponent from './WorkflowCardComponent';

export default function RightFeatureComponent() {
    return (
        <div className="min-w-0 flex-1 flex flex-col gap-y-10 pl-6 py-4">
            <WorkflowCardComponent />
            <LiveEditingCardComponent />
            <SolanaFeatureCardComponent />
        </div>
    );
}
