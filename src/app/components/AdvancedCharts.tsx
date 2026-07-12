import { useState } from 'react';

interface SprintData {
  sprint: string;
  planned: number;
  completed: number;
  velocity: number;
}

export function AdvancedCharts() {
  const [selectedChart, setSelectedChart] = useState<
    'velocity' | 'burnup' | 'cumulative'
  >('velocity');

  // Sample data
  const velocityData: SprintData[] = [
    { sprint: 'Sprint 8', planned: 25, completed: 23, velocity: 23 },
    { sprint: 'Sprint 9', planned: 28, completed: 26, velocity: 26 },
    { sprint: 'Sprint 10', planned: 30, completed: 28, velocity: 28 },
    { sprint: 'Sprint 11', planned: 32, completed: 30, velocity: 30 },
    { sprint: 'Sprint 12', planned: 35, completed: 28, velocity: 28 },
  ];

  const averageVelocity =
    velocityData.reduce((sum, s) => sum + s.velocity, 0) / velocityData.length;

  const burnupData = [
    { day: 0, completed: 0, total: 120, ideal: 0 },
    { day: 2, completed: 15, total: 120, ideal: 24 },
    { day: 4, completed: 32, total: 120, ideal: 48 },
    { day: 6, completed: 55, total: 125, ideal: 72 },
    { day: 8, completed: 78, total: 125, ideal: 96 },
    { day: 10, completed: 105, total: 130, ideal: 120 },
  ];

  const cumulativeFlowData = [
    { day: 'Day 1', notStarted: 45, testing: 12, bugsFound: 8, tested: 15 },
    { day: 'Day 3', notStarted: 38, testing: 15, bugsFound: 7, tested: 20 },
    { day: 'Day 5', notStarted: 30, testing: 18, bugsFound: 5, tested: 27 },
    { day: 'Day 7', notStarted: 20, testing: 20, bugsFound: 8, tested: 32 },
    { day: 'Day 9', notStarted: 12, testing: 15, bugsFound: 6, tested: 47 },
  ];

  const maxHeight = 200;

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Advanced Analytics</h1>
        <p className="text-gray-600">Visualize team performance and trends</p>
      </div>

      {/* Chart Selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setSelectedChart('velocity')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedChart === 'velocity'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Velocity Chart
        </button>
        <button
          onClick={() => setSelectedChart('burnup')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedChart === 'burnup'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Burn-Up Chart
        </button>
        <button
          onClick={() => setSelectedChart('cumulative')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedChart === 'cumulative'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Cumulative Flow
        </button>
      </div>

      {/* Velocity Chart */}
      {selectedChart === 'velocity' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl mb-4 text-gray-800">Sprint Velocity Trend</h2>
          <div className="mb-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-500 rounded"></div>
              <span>Completed Points</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>Planned Points</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-green-500"></div>
              <span>Average Velocity ({averageVelocity.toFixed(1)})</span>
            </div>
          </div>

          <div className="relative" style={{ height: maxHeight + 40 }}>
            {/* Average line */}
            <div
              className="absolute left-0 right-0 border-t-2 border-green-500 border-dashed z-10"
              style={{
                top: `${maxHeight - (averageVelocity / 40) * maxHeight}px`,
              }}
            ></div>

            {/* Bars */}
            <div className="flex items-end justify-between gap-4 h-full pb-8">
              {velocityData.map((data, index) => {
                const plannedHeight = (data.planned / 40) * maxHeight;
                const completedHeight = (data.completed / 40) * maxHeight;
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="w-full flex items-end justify-center gap-1 flex-1">
                      <div
                        className="w-full bg-gray-300 rounded-t relative group cursor-pointer"
                        style={{ height: `${plannedHeight}px` }}
                      >
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          Planned: {data.planned}
                        </div>
                      </div>
                      <div
                        className="w-full bg-indigo-500 rounded-t relative group cursor-pointer"
                        style={{ height: `${completedHeight}px` }}
                      >
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          Completed: {data.completed}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      {data.sprint}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Insights</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>
                • Average velocity: {averageVelocity.toFixed(1)} points per
                sprint
              </li>
              <li>
                • Latest sprint:{' '}
                {velocityData[velocityData.length - 1].velocity} points
                completed
              </li>
              <li>
                • Trend:{' '}
                {velocityData[velocityData.length - 1].velocity >
                averageVelocity
                  ? '📈 Above average'
                  : '📉 Below average'}
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Burn-Up Chart */}
      {selectedChart === 'burnup' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl mb-4 text-gray-800">Sprint Burn-Up Chart</h2>
          <div className="mb-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-green-500"></div>
              <span>Completed Work</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-red-500"></div>
              <span>Total Scope</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gray-400 border-dashed border-t-2"></div>
              <span>Ideal Progress</span>
            </div>
          </div>

          <div
            className="relative bg-gray-50 rounded p-4"
            style={{ height: maxHeight + 40 }}
          >
            <svg className="w-full h-full">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100, 125].map((value, i) => (
                <g key={i}>
                  <line
                    x1="0"
                    y1={maxHeight - (value / 130) * maxHeight}
                    x2="100%"
                    y2={maxHeight - (value / 130) * maxHeight}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text
                    x="5"
                    y={maxHeight - (value / 130) * maxHeight - 5}
                    className="text-xs fill-gray-500"
                  >
                    {value}
                  </text>
                </g>
              ))}

              {/* Ideal line */}
              <polyline
                points={burnupData
                  .map(
                    (d, i) =>
                      `${(i / (burnupData.length - 1)) * 100}%,${maxHeight - (d.ideal / 130) * maxHeight}`
                  )
                  .join(' ')}
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeDasharray="4"
              />

              {/* Total scope line */}
              <polyline
                points={burnupData
                  .map(
                    (d, i) =>
                      `${(i / (burnupData.length - 1)) * 100}%,${maxHeight - (d.total / 130) * maxHeight}`
                  )
                  .join(' ')}
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
              />

              {/* Completed work line */}
              <polyline
                points={burnupData
                  .map(
                    (d, i) =>
                      `${(i / (burnupData.length - 1)) * 100}%,${maxHeight - (d.completed / 130) * maxHeight}`
                  )
                  .join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />
            </svg>
          </div>

          <div className="mt-4 flex justify-between text-xs text-gray-600">
            {burnupData.map((d, i) => (
              <span key={i}>{d.day === 0 ? 'Start' : `Day ${d.day}`}</span>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Scope Changes
            </h3>
            <p className="text-sm text-gray-700">
              Scope increased from 120 to 130 points (+8.3%) during sprint
            </p>
          </div>
        </div>
      )}

      {/* Cumulative Flow Diagram */}
      {selectedChart === 'cumulative' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl mb-4 text-gray-800">
            Cumulative Flow Diagram
          </h2>
          <div className="mb-4 flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Tested</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Bugs Found</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-500 rounded"></div>
              <span>Testing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>Not Started</span>
            </div>
          </div>

          <div
            className="flex items-end justify-between gap-2"
            style={{ height: maxHeight }}
          >
            {cumulativeFlowData.map((data, index) => {
              const total =
                data.notStarted + data.testing + data.bugsFound + data.tested;
              const testedHeight = (data.tested / total) * maxHeight;
              const bugsHeight = (data.bugsFound / total) * maxHeight;
              const testingHeight = (data.testing / total) * maxHeight;
              const notStartedHeight = (data.notStarted / total) * maxHeight;

              return (
                <div key={index} className="flex-1 flex flex-col-reverse">
                  <div
                    className="bg-green-500"
                    style={{ height: `${testedHeight}px` }}
                  ></div>
                  <div
                    className="bg-orange-500"
                    style={{ height: `${bugsHeight}px` }}
                  ></div>
                  <div
                    className="bg-indigo-500"
                    style={{ height: `${testingHeight}px` }}
                  ></div>
                  <div
                    className="bg-gray-400"
                    style={{ height: `${notStartedHeight}px` }}
                  ></div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between text-xs text-gray-600">
            {cumulativeFlowData.map((d, i) => (
              <span key={i}>{d.day}</span>
            ))}
          </div>

          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Flow Metrics
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Work in Progress (WIP): Decreasing trend ✅</li>
              <li>• Throughput: Steady completion rate</li>
              <li>• Bug backlog: Under control (6-8 items)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
