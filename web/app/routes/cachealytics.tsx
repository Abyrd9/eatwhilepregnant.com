import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { getAllMetrics } from "cache/rate-limiter.server";
import { LuRefreshCw } from "react-icons/lu";
import { Button } from "~/primitives/button";

type Metrics = ReturnType<typeof getAllMetrics>;

export const loader: LoaderFunction = async () => {
  const metrics = getAllMetrics();
  return json<Metrics>(metrics);
};

export default function CacheAnalytics() {
  const metrics = useLoaderData() as Metrics;
  const { revalidate } = useRevalidator();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cache Analytics</h1>
        <Button className="space-x-2" size="small" onClick={() => revalidate()}>
          <LuRefreshCw className="" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                Cache Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                Current Size
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                Max Size
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                Memory Usage
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(metrics).map(([name, metric]) => (
              <tr
                key={name}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-sm text-gray-800">{name}</td>
                <td className="px-4 py-3 text-sm text-gray-800">
                  {metric.size}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800">
                  {metric.maxSize}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800">
                  {metric.memoryUsage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
