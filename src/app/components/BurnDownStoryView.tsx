import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Circle,
  Clock,
  AlertTriangle,
  CheckCircle,
  Save,
} from 'lucide-react';

type QualityState = 'Tested' | 'Testing' | 'Bugs Found' | 'Not Started';

interface StoryItem {
  id: string;
  title: string;
  state: QualityState;
  dayCompleted?: number;
  description?: string;
  notes?: string;
}

interface BurnDownStoryViewProps {
  story: StoryItem;
  onUpdateState: (id: string, state: QualityState) => void;
  onBack: () => void;
}

export function BurnDownStoryView({
  story,
  onUpdateState,
  onBack,
}: BurnDownStoryViewProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState(story.notes || '');

  const getStateColor = (state: QualityState) => {
    switch (state) {
      case 'Tested':
        return 'bg-green-500 text-white';
      case 'Testing':
        return 'bg-indigo-500 text-white';
      case 'Bugs Found':
        return 'bg-orange-500 text-white';
      case 'Not Started':
        return 'bg-gray-400 text-white';
    }
  };

  const getStateDescription = (state: QualityState) => {
    switch (state) {
      case 'Tested':
        return 'This story has passed all quality checks and is ready for deployment.';
      case 'Testing':
        return 'QA is currently testing this story. Testing is in progress.';
      case 'Bugs Found':
        return 'Bugs or issues have been identified during testing. Requires developer attention.';
      case 'Not Started':
        return 'Testing has not yet begun for this story.';
    }
  };

  const canUpdateState = user?.role === 'QA Engineer';

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Burn-Down Tracker
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-sm text-gray-500">{story.id}</span>
              <h1 className="text-3xl text-gray-900 mt-1">{story.title}</h1>
            </div>
            <div>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full ${getStateColor(story.state)}`}
              >
                {story.state}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {story.description && (
            <div>
              <h3 className="text-lg text-gray-800 mb-2">Description</h3>
              <p className="text-gray-700">{story.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg text-gray-800 mb-3">
              Current Quality State
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full ${getStateColor(story.state)}`}
                >
                  {story.state}
                </span>
                {story.dayCompleted && (
                  <span className="text-sm text-gray-600">
                    Completed on Day {story.dayCompleted}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700">
                {getStateDescription(story.state)}
              </p>
            </div>
          </div>

          {canUpdateState && (
            <div>
              <h3 className="text-lg text-gray-800 mb-3">
                Update Quality State
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => onUpdateState(story.id, 'Not Started')}
                  disabled={story.state === 'Not Started'}
                  className="btn bg-gray-400 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Circle className="w-4 h-4" />
                  Not Started
                </button>
                <button
                  onClick={() => onUpdateState(story.id, 'Testing')}
                  disabled={story.state === 'Testing'}
                  className="btn bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Clock className="w-4 h-4" />
                  Testing
                </button>
                <button
                  onClick={() => onUpdateState(story.id, 'Bugs Found')}
                  disabled={story.state === 'Bugs Found'}
                  className="btn bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Bugs Found
                </button>
                <button
                  onClick={() => onUpdateState(story.id, 'Tested')}
                  disabled={story.state === 'Tested'}
                  className="btn bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  Tested
                </button>
              </div>
            </div>
          )}

          {!canUpdateState && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Only QA Engineers can update quality states. Current role:{' '}
                <strong>{user?.role}</strong>
              </p>
            </div>
          )}

          <div>
            <h3 className="text-lg text-gray-800 mb-3">Testing Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add notes about testing progress, issues found, or resolutions..."
              disabled={!canUpdateState}
            />
            {canUpdateState && (
              <button className="mt-2 btn btn-primary">
                <Save className="w-4 h-4" />
                Save Notes
              </button>
            )}
          </div>

          <div>
            <h3 className="text-lg text-gray-800 mb-3">
              Quality State Timeline
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-gray-700">Not Started</span>
              </div>
              <div className="ml-1.5 w-0.5 h-6 bg-gray-200"></div>
              <div className="flex items-center gap-3 text-sm">
                <div
                  className={`w-3 h-3 rounded-full ${story.state === 'Testing' || story.state === 'Bugs Found' || story.state === 'Tested' ? 'bg-indigo-500' : 'bg-gray-200'}`}
                ></div>
                <span className="text-gray-700">Testing</span>
              </div>
              <div className="ml-1.5 w-0.5 h-6 bg-gray-200"></div>
              <div className="flex items-center gap-3 text-sm">
                <div
                  className={`w-3 h-3 rounded-full ${story.state === 'Bugs Found' ? 'bg-orange-500' : 'bg-gray-200'}`}
                ></div>
                <span className="text-gray-700">
                  Bugs Found (if applicable)
                </span>
              </div>
              <div className="ml-1.5 w-0.5 h-6 bg-gray-200"></div>
              <div className="flex items-center gap-3 text-sm">
                <div
                  className={`w-3 h-3 rounded-full ${story.state === 'Tested' ? 'bg-green-500' : 'bg-gray-200'}`}
                ></div>
                <span className="text-gray-700">Tested</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
