import React, { useState, ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { Bot, LayoutDashboard, Sparkles, MessageSquare, Brain, Sliders, Clock, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface NextGioConfigProps {
  isDark: boolean;
}

interface PersonalityState {
  name: string;
  role: string;
  tone: string;
  greeting: string;
  creativity: number;
}

interface ResponseState {
  maxLength: number;
  temperature: number;
  streamResponse: boolean;
  typingIndicator: boolean;
  responseTime: number;
}

export function NextGioConfig({ isDark }: NextGioConfigProps) {
  // State for configuration settings
  const [personality, setPersonality] = useState<PersonalityState>({
    name: "NextGio",
    role: "AI Assistant",
    tone: "Professional & Friendly",
    greeting: "Hi! I'm NextGio, Giovanni's AI assistant. How can I help you today?",
    creativity: 70,
  });

  const [responses, setResponses] = useState<ResponseState>({
    maxLength: 300,
    temperature: 0.7,
    streamResponse: true,
    typingIndicator: true,
    responseTime: 1000,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof PersonalityState) => {
    setPersonality({ ...personality, [field]: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* NextGio Chatbot Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "rounded-xl border shadow-lg overflow-hidden",
          isDark ? "bg-[#071018]/70 border-white/5" : "bg-white border-slate-200"
        )}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                isDark ? "bg-blue-500/20" : "bg-blue-100"
              )}>
                <Bot className={cn("h-6 w-6", isDark ? "text-blue-400" : "text-blue-600")} />
              </div>
              <div>
                <h2 className={cn(
                  "text-xl font-bold",
                  isDark ? "text-white" : "text-slate-900"
                )}>NextGio Configuration</h2>
                <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Customize your AI assistant's behavior and responses
                </p>
              </div>
            </div>
            <Button
              className={cn(
                "bg-gradient-to-r shadow-lg",
                isDark
                  ? "from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
                  : "from-blue-500 to-blue-400 text-white hover:from-blue-600 hover:to-blue-500"
              )}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>

          {/* Configuration Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personality Settings */}
            <div className={cn(
              "rounded-xl border p-4",
              isDark ? "bg-[#0c1829]/50 border-white/5" : "bg-slate-50 border-slate-200"
            )}>
              <h3 className={cn(
                "text-lg font-semibold mb-4 flex items-center",
                isDark ? "text-white" : "text-slate-900"
              )}>
                <Brain className="h-5 w-5 mr-2" />
                Personality Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={cn(
                    "text-sm font-medium block mb-1.5",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    Assistant Name
                  </label>
                  <Input
                    value={personality.name}
                    onChange={(e) => handleInputChange(e, 'name')}
                    className={cn(
                      "w-full",
                      isDark 
                        ? "bg-[#071018]/50 border-white/10 text-white" 
                        : "bg-white border-gray-200"
                    )}
                  />
                </div>

                <div>
                  <label className={cn(
                    "text-sm font-medium block mb-1.5",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    Role Description
                  </label>
                  <Input
                    value={personality.role}
                    onChange={(e) => handleInputChange(e, 'role')}
                    className={cn(
                      "w-full",
                      isDark 
                        ? "bg-[#071018]/50 border-white/10 text-white" 
                        : "bg-white border-gray-200"
                    )}
                  />
                </div>

                <div>
                  <label className={cn(
                    "text-sm font-medium block mb-1.5",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    Conversation Tone
                  </label>
                  <Input
                    value={personality.tone}
                    onChange={(e) => handleInputChange(e, 'tone')}
                    className={cn(
                      "w-full",
                      isDark 
                        ? "bg-[#071018]/50 border-white/10 text-white" 
                        : "bg-white border-gray-200"
                    )}
                  />
                </div>

                <div>
                  <label className={cn(
                    "text-sm font-medium block mb-1.5",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    Default Greeting
                  </label>
                  <Textarea
                    value={personality.greeting}
                    onChange={(e) => handleInputChange(e, 'greeting')}
                    className={cn(
                      "w-full",
                      isDark 
                        ? "bg-[#071018]/50 border-white/10 text-white" 
                        : "bg-white border-gray-200"
                    )}
                  />
                </div>

                <div>
                  <label className={cn(
                    "text-sm font-medium block mb-1.5",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    Creativity Level
                  </label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[personality.creativity]}
                      onValueChange={(value: number[]) => setPersonality({ ...personality, creativity: value[0] })}
                      max={100}
                      step={1}
                      className={cn(
                        "flex-1",
                        isDark ? "[&_[role=slider]]:bg-blue-400" : "[&_[role=slider]]:bg-blue-600"
                      )}
                    />
                    <span className={cn(
                      "text-sm font-medium",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      {personality.creativity}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Settings */}
            <div className={cn(
              "rounded-xl border p-4",
              isDark ? "bg-[#0c1829]/50 border-white/5" : "bg-slate-50 border-slate-200"
            )}>
              <h3 className={cn(
                "text-lg font-semibold mb-4 flex items-center",
                isDark ? "text-white" : "text-slate-900"
              )}>
                <Sliders className="h-5 w-5 mr-2" />
                Response Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={cn(
                    "text-sm font-medium block mb-1.5",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    Maximum Response Length
                  </label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[responses.maxLength]}
                      onValueChange={(value: number[]) => setResponses({ ...responses, maxLength: value[0] })}
                      max={1000}
                      step={10}
                      className={cn(
                        "flex-1",
                        isDark ? "[&_[role=slider]]:bg-blue-400" : "[&_[role=slider]]:bg-blue-600"
                      )}
                    />
                    <span className={cn(
                      "text-sm font-medium",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      {responses.maxLength} chars
                    </span>
                  </div>
                </div>

                <div>
                  <label className={cn(
                    "text-sm font-medium block mb-1.5",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    Temperature (Randomness)
                  </label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[responses.temperature * 100]}
                      onValueChange={(value: number[]) => setResponses({ ...responses, temperature: value[0] / 100 })}
                      max={100}
                      step={1}
                      className={cn(
                        "flex-1",
                        isDark ? "[&_[role=slider]]:bg-blue-400" : "[&_[role=slider]]:bg-blue-600"
                      )}
                    />
                    <span className={cn(
                      "text-sm font-medium",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      {responses.temperature.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className={cn(
                    "text-sm font-medium block mb-1.5",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    Response Time (ms)
                  </label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[responses.responseTime]}
                      onValueChange={(value: number[]) => setResponses({ ...responses, responseTime: value[0] })}
                      min={100}
                      max={3000}
                      step={100}
                      className={cn(
                        "flex-1",
                        isDark ? "[&_[role=slider]]:bg-blue-400" : "[&_[role=slider]]:bg-blue-600"
                      )}
                    />
                    <span className={cn(
                      "text-sm font-medium",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      {responses.responseTime}ms
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className={cn(
                        "text-sm font-medium block",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}>
                        Stream Response
                      </label>
                      <p className={cn(
                        "text-xs",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}>
                        Show response as it's being generated
                      </p>
                    </div>
                    <Switch
                      checked={responses.streamResponse}
                      onCheckedChange={(checked: boolean) => setResponses({ ...responses, streamResponse: checked })}
                      className={cn(
                        isDark 
                          ? "data-[state=checked]:bg-blue-400" 
                          : "data-[state=checked]:bg-blue-600"
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className={cn(
                        "text-sm font-medium block",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}>
                        Typing Indicator
                      </label>
                      <p className={cn(
                        "text-xs",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}>
                        Show typing animation before response
                      </p>
                    </div>
                    <Switch
                      checked={responses.typingIndicator}
                      onCheckedChange={(checked: boolean) => setResponses({ ...responses, typingIndicator: checked })}
                      className={cn(
                        isDark 
                          ? "data-[state=checked]:bg-blue-400" 
                          : "data-[state=checked]:bg-blue-600"
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 