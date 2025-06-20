import { useState } from "react";

interface SettingsProps {
  model: string;
  setAIModel: (value: React.SyntheticEvent) => void;
}

const Settings: React.FC<SettingsProps> = ({ model, setAIModel }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <button
          className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 text-white"
          onClick={() => setModalOpen(true)}
        >
          Settings
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center modal-body">
          <div className="bg-gray-800 p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button onClick={() => setModalOpen(false)}>❌</button>
            </div>

            <div className="mb-4 p-4">
              <label className="block mb-1 text-white py-3">Model:</label>
              <select
                value={model}
                onChange={(e) => setAIModel(e)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                <option value="gemini-2.0-pro">Gemini 2.0 Pro</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-600 px-4 py-2 rounded text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
