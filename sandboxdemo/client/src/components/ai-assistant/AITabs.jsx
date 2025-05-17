import React from "react";

const AITabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "writing", name: "Writing", icon: "✏️" },
    { id: "research", name: "Research", icon: "🔍" },
    { id: "analysis", name: "Analysis", icon: "📊" },
    { id: "summarize", name: "Summarize", icon: "📝" },
    { id: "generate", name: "Generate", icon: "✨" },
    { id: "chat", name: "Chat", icon: "💬" },
  ];

  return (
    <div className="ai-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`ai-tab ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
          title={tab.name}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-name">{tab.name}</span>
        </button>
      ))}
    </div>
  );
};

export default AITabs;
