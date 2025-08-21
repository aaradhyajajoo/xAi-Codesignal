import React, { useState } from 'react';

function LeadList({ leads, onGenerateMessage, onUpdateLeadScore, onUpdateLeadMessage, onUpdateLeadStage }) {
  const [rescoreWeights, setRescoreWeights] = useState({});
  const [showRescoreModal, setShowRescoreModal] = useState(null);
  const [rescoreLoading, setRescoreLoading] = useState({});
  const [messageLoading, setMessageLoading] = useState({});
  const [showInteractionModal, setShowInteractionModal] = useState(null);
  const [interactionLoading, setInteractionLoading] = useState({});
  const [interactionData, setInteractionData] = useState({});
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRescore = async (leadId) => {
    const weights = rescoreWeights[leadId];
    
    if (!weights || (!weights.budget && !weights.industry && !weights.needs)) {
      console.log('No weights provided for rescoring');
      return;
    }
    
    // Close modal immediately when apply is clicked
    setShowRescoreModal(null);
    
    try {
      setRescoreLoading({ ...rescoreLoading, [leadId]: true });
      console.log('Rescoring lead:', leadId, 'with weights:', weights);
      
      const response = await fetch(`/leads/${leadId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weights: weights })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Rescore successful:', result);
      
      // Update the specific lead's score locally instead of reloading all data
      if (onUpdateLeadScore && result.score !== undefined) {
        onUpdateLeadScore(leadId, result.score);
      }
      
      // Clear weights after successful rescore
      setRescoreWeights({ ...rescoreWeights, [leadId]: {} });
      
    } catch (error) {
      console.error('Error rescoring lead:', error);
    } finally {
      setRescoreLoading({ ...rescoreLoading, [leadId]: false });
    }
  };

  const handleGenerateMessage = async (leadId) => {
    try {
      setMessageLoading({ ...messageLoading, [leadId]: true });
      const response = await fetch(`/leads/${leadId}/message`, { method: 'POST' });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Message generated successfully:', result);
        
        // Update the specific lead's message locally instead of reloading all data
        if (onUpdateLeadMessage && result.message) {
          onUpdateLeadMessage(leadId, result.message);
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error generating message:', error);
    } finally {
      setMessageLoading({ ...messageLoading, [leadId]: false });
    }
  };

  const handleAddInteraction = async (leadId) => {
    const interaction = interactionData[leadId];
    
    if (!interaction || !interaction.message || !interaction.direction) {
      console.log('Missing interaction data');
      return;
    }
    
    // Close modal immediately when submit is clicked
    setShowInteractionModal(null);
    
    try {
      setInteractionLoading({ ...interactionLoading, [leadId]: true });
      console.log('Adding interaction for lead:', leadId, 'with data:', interaction);
      
      const response = await fetch(`/add_interaction/${leadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: interaction.message,
          direction: interaction.direction,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Interaction added successfully:', result);
      
      // Clear interaction data after successful submission
      setInteractionData({ ...interactionData, [leadId]: {} });
      
      // Update the lead's stage locally based on interaction direction
      if (onUpdateLeadStage) {
        const newStage = interaction.direction === 'outbound' ? 'reached_out' : 'response_received';
        onUpdateLeadStage(leadId, newStage);
        
        // Show success notification
        setSuccessMessage(`Interaction added! Lead stage updated to ${formatStageLabel(newStage)}`);
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000); // Hide after 3 seconds
      }
      
    } catch (error) {
      console.error('Error adding interaction:', error);
    } finally {
      setInteractionLoading({ ...interactionLoading, [leadId]: false });
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'potential_lead': return 'bg-yellow-100 text-yellow-800';
      case 'reached_out': return 'bg-blue-100 text-blue-800';
      case 'response_received': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to format stage labels for display
  const formatStageLabel = (stage) => {
    switch (stage) {
      case 'potential_lead': return 'Potential Lead';
      case 'reached_out': return 'Reached Out';
      case 'response_received': return 'Response Received';
      default: return stage;
    }
  };

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
        <p className="text-gray-600">Get started by adding your first lead above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          Lead Pipeline ({leads.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leads.map(lead => (
          <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{lead.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{lead.company}</p>
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(lead.stage)}`}>
                    {formatStageLabel(lead.stage) || 'Prospect'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                    Score: {lead.score || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">${lead.budget}</p>
                <p className="text-sm text-gray-500">Budget</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-gray-600">{lead.industry}</span>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-medium text-gray-900 mb-1">Needs:</p>
                <p className="text-gray-600">{lead.needs}</p>
              </div>
              {lead.last_message && (
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">Last Message:</p>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{lead.last_message}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRescoreModal(lead.id)}
                disabled={rescoreLoading[lead.id]}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rescoreLoading[lead.id] ? (
                  <svg className="animate-spin h-4 w-4 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Rescore
                  </>
                )}
              </button>
              <button
                onClick={() => handleGenerateMessage(lead.id)}
                disabled={messageLoading[lead.id]}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {messageLoading[lead.id] ? (
                  <svg className="animate-spin h-4 w-4 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Generate Message
                  </>
                )}
              </button>
              <button
                onClick={() => setShowInteractionModal(lead.id)}
                disabled={interactionLoading[lead.id]}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {interactionLoading[lead.id] ? (
                  <svg className="animate-spin h-4 w-4 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Add Interaction
                  </>
                )}
              </button>
            </div>

            {/* Rescore Modal */}
            {showRescoreModal === lead.id && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Scoring Weights</h3>
                    <p className="text-sm text-gray-600 mb-4">Enter weights between 0 and 1. Total should ideally equal 1.</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget Weight</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          placeholder="0.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={rescoreWeights[lead.id]?.budget || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            console.log('Setting budget weight for lead', lead.id, 'to', value);
                            setRescoreWeights({
                              ...rescoreWeights,
                              [lead.id]: { ...rescoreWeights[lead.id], budget: value }
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry Weight</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          placeholder="0.3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={rescoreWeights[lead.id]?.industry || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            console.log('Setting industry weight for lead', lead.id, 'to', value);
                            setRescoreWeights({
                              ...rescoreWeights,
                              [lead.id]: { ...rescoreWeights[lead.id], industry: value }
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Needs Weight</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          placeholder="0.2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={rescoreWeights[lead.id]?.needs || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            console.log('Setting needs weight for lead', lead.id, 'to', value);
                            setRescoreWeights({
                              ...rescoreWeights,
                              [lead.id]: { ...rescoreWeights[lead.id], needs: value }
                            });
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => {
                          console.log('Apply button clicked for lead', lead.id);
                          console.log('Current weights:', rescoreWeights[lead.id]);
                          handleRescore(lead.id);
                        }}
                        disabled={!rescoreWeights[lead.id] || (!rescoreWeights[lead.id].budget && !rescoreWeights[lead.id].industry && !rescoreWeights[lead.id].needs) || rescoreLoading[lead.id]}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                      >
                        {rescoreLoading[lead.id] ? (
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          'Apply'
                        )}
                      </button>
                      <button
                        onClick={() => setShowRescoreModal(null)}
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Interaction Modal */}
            {showInteractionModal === lead.id && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add Interaction</h3>
                    <p className="text-sm text-gray-600 mb-4">Record a new interaction with this lead.</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                          rows="3"
                          placeholder="Enter the interaction message..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          value={interactionData[lead.id]?.message || ''}
                          onChange={(e) => {
                            setInteractionData({
                              ...interactionData,
                              [lead.id]: { ...interactionData[lead.id], message: e.target.value }
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          value={interactionData[lead.id]?.direction || ''}
                          onChange={(e) => {
                            setInteractionData({
                              ...interactionData,
                              [lead.id]: { ...interactionData[lead.id], direction: e.target.value }
                            });
                          }}
                        >
                          <option value="">Select direction...</option>
                          <option value="inbound">Inbound (Lead contacted us)</option>
                          <option value="outbound">Outbound (We contacted lead)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => {
                          console.log('Submit button clicked for lead', lead.id);
                          console.log('Current interaction data:', interactionData[lead.id]);
                          handleAddInteraction(lead.id);
                        }}
                        disabled={!interactionData[lead.id] || !interactionData[lead.id].message || !interactionData[lead.id].direction || interactionLoading[lead.id]}
                        className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                      >
                        {interactionLoading[lead.id] ? (
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          'Submit'
                        )}
                      </button>
                      <button
                        onClick={() => setShowInteractionModal(null)}
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeadList;