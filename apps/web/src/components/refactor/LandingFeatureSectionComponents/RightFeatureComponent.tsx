import LiveEditingCardComponent from './LiveEditingCardComponent';
import SolanaFeatureCardComponent from './SolanaFeatureCardComponent';
import WorkflowCardComponent from './WorkflowCardComponent';

export default function RightFeatureComponent() {
    return (
        <div className="min-w-0 w-full lg:flex-1 flex flex-col items-center lg:items-start gap-y-10 px-6 py-4">
            <WorkflowCardComponent />
            <LiveEditingCardComponent />
            <SolanaFeatureCardComponent />
        </div>
    );
}
