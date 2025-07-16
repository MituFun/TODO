"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { motion, AnimatePresence } from "framer-motion"

interface SettingsProps {
  onBack: () => void
}

export function SettingsPage({ onBack }: SettingsProps) {
  const [particleCount, setParticleCount] = useState(30)
  const [importText, setImportText] = useState("")
  const [importMessage, setImportMessage] = useState("")

  // 加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem("daily-todo-settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setParticleCount(settings.particleCount || 30)
    }
  }, [])

  // 保存设置
  const saveSettings = () => {
    const settings = {
      particleCount,
    }
    localStorage.setItem("daily-todo-settings", JSON.stringify(settings))
  }

  // 实时保存设置
  useEffect(() => {
    saveSettings()
  }, [particleCount])

  // 导出任务
  const exportTasks = async () => {
    try {
      const savedTasks = localStorage.getItem("daily-todo-tasks")
      const tasks = savedTasks ? JSON.parse(savedTasks) : []

      const exportData = {
        tasks,
        exportDate: new Date().toISOString(),
        version: "1.0",
      }

      const jsonString = JSON.stringify(exportData)
      const base64Data = btoa(unescape(encodeURIComponent(jsonString)))

      // 复制到剪切板
      await navigator.clipboard.writeText(base64Data)
      setImportMessage("任务数据已复制到剪切板！")
      setTimeout(() => setImportMessage(""), 3000)
    } catch (error) {
      setImportMessage("复制失败，请手动复制下方文本")
      setTimeout(() => setImportMessage(""), 3000)
    }
  }

  // 处理导入
  const processImport = () => {
    try {
      if (!importText.trim()) {
        setImportMessage("请输入要导入的数据")
        return
      }

      // 解码base64
      const decodedString = decodeURIComponent(escape(atob(importText.trim())))
      const importData = JSON.parse(decodedString)

      if (!importData.tasks || !Array.isArray(importData.tasks)) {
        throw new Error("数据格式不正确")
      }

      // 验证任务数据结构
      const validTasks = importData.tasks.filter(
        (task: any) => task.id && task.name && typeof task.total === "number" && typeof task.current === "number",
      )

      if (validTasks.length === 0) {
        throw new Error("没有找到有效的任务数据")
      }

      // 询问是否覆盖现有数据
      const shouldOverwrite = confirm(`将导入 ${validTasks.length} 个任务，是否覆盖现有数据？`)

      if (shouldOverwrite) {
        localStorage.setItem("daily-todo-tasks", JSON.stringify(validTasks))
        setImportMessage(`成功导入 ${validTasks.length} 个任务！页面将自动刷新。`)
        setImportText("")

        // 3秒后刷新页面
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      setImportMessage("导入失败：数据格式不正确或已损坏")
      setTimeout(() => setImportMessage(""), 3000)
    }
  }

  // 测试粒子效果
  const testParticles = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    // 触发测试粒子效果的事件
    window.dispatchEvent(
      new CustomEvent("test-particles", {
        detail: { x, y, particleCount },
      }),
    )
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>数据管理</CardTitle>
            <p className="text-xs text-muted-foreground">可以用来同步不同设备之间的任务进度</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div className="space-y-2" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Label>导出任务数据</Label>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={exportTasks}
                    className="w-full bg-transparent transition-all duration-300"
                    variant="outline"
                  >
                    复制到剪切板
                  </Button>
                </motion.div>
                <p className="text-xs text-muted-foreground">将所有任务数据复制到剪切板</p>
              </motion.div>

              <motion.div className="space-y-2" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Label>导入任务数据</Label>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setImportText(" ")}
                    className="w-full transition-all duration-300"
                    variant="outline"
                  >
                    显示导入框
                  </Button>
                </motion.div>
                <p className="text-xs text-muted-foreground">粘贴之前导出的任务数据</p>
              </motion.div>
            </div>

            <AnimatePresence>
              {importText && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Label htmlFor="import-text">粘贴导出的任务数据</Label>
                  <motion.textarea
                    id="import-text"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="在此粘贴导出的任务数据..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md resize-none text-sm transition-all duration-300 focus:shadow-md focus:border-blue-500"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button onClick={processImport} className="w-full transition-all duration-300">
                        确认导入
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => setImportText("")}
                        variant="outline"
                        className="transition-all duration-300"
                      >
                        取消
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {importMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`text-sm ${importMessage.includes("成功") || importMessage.includes("复制") ? "text-green-600" : "text-red-600"}`}
                >
                  {importMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>粒子效果设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                <Label htmlFor="particle-count">粒子数量: {particleCount}</Label>
                <div className="mt-2">
                  <Slider
                    id="particle-count"
                    min={10}
                    max={100}
                    step={5}
                    value={[particleCount]}
                    onValueChange={(value) => setParticleCount(value[0])}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>少 (10)</span>
                  <span>多 (100)</span>
                </div>
              </motion.div>

              <motion.div className="space-y-2" whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                <Label>或直接输入数值:</Label>
                <Input
                  type="number"
                  min="1"
                  max="200"
                  value={particleCount}
                  onChange={(e) => setParticleCount(Number(e.target.value))}
                  className="w-32 transition-all duration-300 focus:shadow-md"
                />
              </motion.div>

              <div className="pt-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={testParticles} className="w-full transition-all duration-300 hover:shadow-lg">
                    测试粒子效果
                  </Button>
                </motion.div>
                <p className="text-xs text-muted-foreground mt-2 text-center">点击按钮查看当前设置的粒子效果</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>效果说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                • 粒子数量越多效果越好，但可能影响性能
              </motion.p>
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                • 建议手机使用 10-30，电脑使用 30-80
              </motion.p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" onClick={onBack} className="transition-all duration-300 bg-transparent">
            返回作业列表
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
