import React, { useState, useRef, useEffect } from 'react';
import { useScenario } from '../context/ScenarioContext';
import { isGeminiConfigured } from '../services/geminiClient';
import { chatWithPackagingCopilot } from '../services/aiFoodScienceService';
import type { ChatMessage } from '../domain/types';
import { defaultSeedData } from '../engine';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Trash2,
  Settings2,
} from 'lucide-react';

interface Props {
  onOpenSettings: () => void;
}

export const AiCopilotDrawer: React.FC<Props> = ({ onOpenSettings }) => {
  const { input, result, scenarioName } = useScenario();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(() => isGeminiConfigured());

  const currentCommodity = defaultSeedData.commodities.find((c) => c.id === input.commodityId);
  const topCandidate = result.candidates[0];

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I am your AI Packaging Scientist. Ask me about barrier calculations, Modified Atmosphere Packaging (MAP) gas mixtures, active packaging sachets (desiccants/scavengers), or Indian FSSAI/PWM compliance rules.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Update configuration status when drawer opens
  useEffect(() => {
    if (isOpen) {
      setConfigured(isGeminiConfigured());
    }
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    if (!configured) {
      onOpenSettings();
      return;
    }

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatWithPackagingCopilot([...messages, userMsg], {
        scenario: input,
        candidate: topCandidate,
        commodity: currentCommodity,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue: ${err.message || 'Failed to connect to Gemini API.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSend(promptText);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Chat history cleared. How can I assist with your food packaging formulation?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="no-print"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 18px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 'var(--font-size-sm)',
          transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <Sparkles size={18} />
        <span>AI Co-Pilot</span>
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI Packaging Co-Pilot"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1050,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              height: '100%',
              backgroundColor: 'var(--color-surface)',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: 'var(--space-4)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--color-surface-sunken)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-md)', margin: 0 }}>
                    Packaging AI Co-Pilot
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Context: {scenarioName} &bull; {currentCommodity?.name}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  title="Configure Gemini API Key"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    padding: '6px',
                  }}
                >
                  <Settings2 size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear Conversation"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    padding: '6px',
                  }}
                >
                  <Trash2 size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text)',
                    padding: '6px',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Offline notice if key not configured */}
            {!configured && (
              <div
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-warning-subtle)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <span>Gemini API Key required to run the AI Co-Pilot.</span>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="btn-primary btn-sm"
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                >
                  Configure
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start',
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                    }}
                  >
                    {!isUser && (
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary-subtle)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <Bot size={16} />
                      </div>
                    )}

                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: isUser ? 'var(--color-primary)' : 'var(--color-surface-sunken)',
                        color: isUser ? '#FFFFFF' : 'var(--color-text)',
                        fontSize: 'var(--font-size-sm)',
                        lineHeight: 1.5,
                        boxShadow: 'var(--shadow-sm)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.content}
                      <div
                        style={{
                          fontSize: '10px',
                          textAlign: isUser ? 'right' : 'left',
                          opacity: 0.65,
                          marginTop: '4px',
                        }}
                      >
                        {msg.timestamp}
                      </div>
                    </div>

                    {isUser && (
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-surface-sunken)',
                          color: 'var(--color-text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <User size={16} />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                  <Bot size={16} />
                  <span>Thinking with Gemini food science knowledge...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderTop: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-sunken)',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              <button
                type="button"
                onClick={() => handleQuickPrompt(`What MAP gas mix is optimal for ${currentCommodity?.name}?`)}
                style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                💨 MAP Gas Mix
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt(`Do I need anti-fog coating or silica gel desiccant for ${currentCommodity?.name}?`)}
                style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                💧 Desiccant / Anti-fog
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt(`Is ${topCandidate?.name || 'this material'} compliant with FSSAI 2018 migration limits?`)}
                style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                ⚖️ FSSAI Compliance
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt(`What are the Extended Producer Responsibility (EPR) recycling rules for this pack?`)}
                style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                ♻️ Plastic Waste EPR
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                gap: 'var(--space-2)',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={configured ? "Ask a packaging or food science question..." : "Configure API key to chat..."}
                disabled={!configured || loading}
                className="form-input"
                style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}
              />
              <button
                type="submit"
                disabled={!configured || !inputMessage.trim() || loading}
                className="btn-primary btn-sm"
                style={{ height: '38px', padding: '0 14px' }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
