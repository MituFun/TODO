"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Settings, Check, Edit, Cog, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ParticleEffects } from "./particle-effects"
import { EditTaskDialog } from "./edit-task-dialog"
import { SettingsPage } from "./settings-page"
import { AnimatePresence, motion } from "framer-motion"

interface Task {
  id: string
  name: string
  total: number
  current: number
  defaultIncrement: number
  createdDate: string
  lastUpdatedDate?: string // 添加这个字段
}

interface ParticleState {
  show: boolean
  x: number
  y: number
}

export default function Component() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskTotal, setNewTaskTotal] = useState(100)
  const [newTaskIncrement, setNewTaskIncrement] = useState(1)
  const [customIncrements, setCustomIncrements] = useState<{ [key: string]: boolean }>({})
  const [customValues, setCustomValues] = useState<{ [key: string]: number }>({})
  const [currentView, setCurrentView] = useState<"tasks" | "add" | "settings">("tasks")
  const [particles, setParticles] = useState<ParticleState>({ show: false, x: 0, y: 0 })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [particleCount, setParticleCount] = useState(30)

  // 加载数据
  useEffect(() => {
    const savedTasks = localStorage.getItem("daily-todo-tasks")
    const lastResetDate = localStorage.getItem("daily-todo-last-reset")
    const savedSettings = localStorage.getItem("daily-todo-settings")
    const today = new Date().toDateString()

    // 加载设置
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setParticleCount(settings.particleCount || 30)
    }

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks)
      setTasks(parsedTasks)
    } else {
      localStorage.setItem("daily-todo-last-reset", today)
    }
  }, [])

  // 监听测试粒子效果事件
  useEffect(() => {
    const handleTestParticles = (event: CustomEvent) => {
      const { x, y, particleCount: testParticleCount } = event.detail
      setParticles({ show: true, x, y })
      setParticleCount(testParticleCount)
    }

    window.addEventListener("test-particles", handleTestParticles as EventListener)
    return () => {
      window.removeEventListener("test-particles", handleTestParticles as EventListener)
    }
  }, [])

  // 保存数据
  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks)
    localStorage.setItem("daily-todo-tasks", JSON.stringify(updatedTasks))
  }

  // 添加新任务
  const addTask = () => {
    if (newTaskName.trim() === "") return

    const newTask: Task = {
      id: Date.now().toString(),
      name: newTaskName.trim(),
      total: newTaskTotal,
      current: 0,
      defaultIncrement: newTaskIncrement,
      createdDate: new Date().toDateString(),
    }

    const updatedTasks = [...tasks, newTask]
    saveTasks(updatedTasks)

    setNewTaskName("")
    setNewTaskTotal(100)
    setNewTaskIncrement(1)

    // 添加成功后跳转到作业列表
    setCurrentView("tasks")
  }

  // 删除任务
  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id)
    saveTasks(updatedTasks)

    // 清理相关状态
    const newCustomIncrements = { ...customIncrements }
    const newCustomValues = { ...customValues }
    delete newCustomIncrements[id]
    delete newCustomValues[id]
    setCustomIncrements(newCustomIncrements)
    setCustomValues(newCustomValues)
  }

  // 触发粒子效果
  const triggerParticles = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    setParticles({ show: true, x, y })
  }

  // 完成任务（默认增量）
  const completeTask = (id: string, event: React.MouseEvent) => {
    const today = new Date().toDateString()
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const newCurrent = Math.min(task.current + task.defaultIncrement, task.total)
        return { ...task, current: newCurrent, lastUpdatedDate: today }
      }
      return task
    })
    saveTasks(updatedTasks)
    triggerParticles(event)
  }

  // 自定义进度增加
  const addCustomProgress = (id: string, event: React.MouseEvent) => {
    const today = new Date().toDateString()
    const customValue = customValues[id] || 1
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const newCurrent = Math.max(0, Math.min(task.current + customValue, task.total))
        return { ...task, current: newCurrent, lastUpdatedDate: today }
      }
      return task
    })
    saveTasks(updatedTasks)
    triggerParticles(event)

    // 隐藏自定义输入
    setCustomIncrements((prev) => ({ ...prev, [id]: false }))
  }

  // 切换自定义增量显示
  const toggleCustomIncrement = (id: string) => {
    setCustomIncrements((prev) => ({ ...prev, [id]: !prev[id] }))
    if (!customValues[id]) {
      setCustomValues((prev) => ({ ...prev, [id]: 1 }))
    }
  }

  // 编辑任务
  const editTask = (task: Task) => {
    setEditingTask(task)
    setEditDialogOpen(true)
  }

  // 保存编辑的任务
  const saveEditedTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    saveTasks(updatedTasks)
  }

  // 计算进度百分比
  const getProgressPercentage = (current: number, total: number) => {
    return Math.round((current / total) * 100)
  }

  // 计算总进度
  const getTotalProgress = () => {
    if (tasks.length === 0) return { current: 0, total: 0, percentage: 0 }

    const totalCurrent = tasks.reduce((sum, task) => sum + task.current, 0)
    const totalMax = tasks.reduce((sum, task) => sum + task.total, 0)
    const percentage = Math.round((totalCurrent / totalMax) * 100)

    return { current: totalCurrent, total: totalMax, percentage }
  }

  // 检查任务是否在今天完成
  const isCompletedToday = (task: Task) => {
    const today = new Date().toDateString()
    return task.lastUpdatedDate === today
  }

  const totalProgress = getTotalProgress()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 标题动画 */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h1
          className="text-3xl font-bold mb-2"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          To-Do List
        </motion.h1>
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          今日日期: {new Date().toLocaleDateString("zh-CN")}
        </motion.p>
      </motion.div>

      {/* 导航按钮动画 */}
      <motion.div
        className="flex justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {[
          { view: "tasks", icon: Check, label: "作业列表" },
          { view: "add", icon: Plus, label: "添加作业" },
          { view: "settings", icon: Cog, label: "设置" },
        ].map((item, index) => (
          <motion.div
            key={item.view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Button
              variant={currentView === item.view ? "default" : "outline"}
              onClick={() => setCurrentView(item.view as any)}
              className="flex items-center gap-2 transition-all duration-300 hover:shadow-lg"
            >
              <motion.div animate={{ rotate: currentView === item.view ? 360 : 0 }} transition={{ duration: 0.3 }}>
                <item.icon className="w-4 h-4" />
              </motion.div>
              {item.label}
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* 页面内容动画容器 */}
      <AnimatePresence mode="wait">
        {/* 设置页面 */}
        {currentView === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <SettingsPage onBack={() => setCurrentView("tasks")} />
          </motion.div>
        )}

        {/* 作业展示页面 */}
        {currentView === "tasks" && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* 总进度动画 */}
            {tasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <motion.span initial={{ x: -20 }} animate={{ x: 0 }} transition={{ duration: 0.3 }}>
                        总体进度
                      </motion.span>
                      <motion.span
                        className="text-2xl font-bold text-primary"
                        key={totalProgress.percentage}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {totalProgress.percentage}%
                      </motion.span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          总进度: {totalProgress.current} / {totalProgress.total}
                        </span>
                        <span>{totalProgress.percentage}%</span>
                      </div>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        style={{ transformOrigin: "left" }}
                      >
                        <Progress value={totalProgress.percentage} className="h-4" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 统计信息动画 */}
            {tasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                  <CardHeader>
                    <CardTitle>今日统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      {[
                        { value: tasks.length, label: "总作业数", color: "text-blue-600" },
                        {
                          value: tasks.filter((task) => isCompletedToday(task)).length,
                          label: "今日已完成",
                          color: "text-green-600",
                        },
                        {
                          value: tasks.filter((task) => task.current > 0 && task.current < task.total).length,
                          label: "进行中",
                          color: "text-blue-600",
                        },
                        {
                          value: tasks.filter((task) => task.current === 0).length,
                          label: "未开始",
                          color: "text-gray-600",
                        },
                      ].map((stat, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <motion.div
                            className={`text-2xl font-bold ${stat.color}`}
                            key={stat.value}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                          >
                            {stat.value}
                          </motion.div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 任务列表动画 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              {tasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                    <CardContent className="text-center py-12">
                      <div className="space-y-4">
                        <motion.div
                          className="text-6xl"
                          animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatDelay: 3,
                            ease: "easeInOut",
                          }}
                        >
                          📚
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.4 }}
                        >
                          <p className="text-lg font-medium mb-2">还没有添加任何作业</p>
                          <p className="text-muted-foreground mb-4">点击上方"添加作业"按钮开始添加第一个作业吧！</p>
                          <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <Button onClick={() => setCurrentView("add")} className="flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              添加第一个作业
                            </Button>
                          </motion.div>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {tasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -100, scale: 0.95 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.4 + index * 0.05,
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      layout
                      layoutId={task.id}
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            {/* 任务标题和状态 */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <motion.h3
                                  className="text-lg font-semibold"
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                  {task.name}
                                </motion.h3>
                                <AnimatePresence>
                                  {isCompletedToday(task) && (
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0, x: -20 }}
                                      animate={{ opacity: 1, scale: 1, x: 0 }}
                                      exit={{ opacity: 0, scale: 0 }}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"
                                    >
                                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                                        <Check className="w-3 h-3" />
                                      </motion.div>
                                      今日已完成
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 90, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              >
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => editTask(task)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      编辑任务
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => deleteTask(task.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      删除任务
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </motion.div>
                            </div>

                            {/* 进度信息 */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>
                                  进度: {task.current} / {task.total}
                                </span>
                                <motion.span
                                  key={getProgressPercentage(task.current, task.total)}
                                  initial={{ scale: 1.2, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  {getProgressPercentage(task.current, task.total)}%
                                </motion.span>
                              </div>
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                style={{ transformOrigin: "left" }}
                              >
                                <Progress value={getProgressPercentage(task.current, task.total)} className="h-3" />
                              </motion.div>
                            </div>

                            {/* 操作按钮 */}
                            <div className="flex items-center gap-2">
                              <motion.div
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              >
                                <Button
                                  onClick={(e) => completeTask(task.id, e)}
                                  disabled={task.current >= task.total}
                                  className="flex items-center gap-2 transition-all duration-300"
                                >
                                  <motion.div
                                    animate={{ rotate: task.current >= task.total ? 360 : 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <Check className="w-4 h-4" />
                                  </motion.div>
                                  完成 (+{task.defaultIncrement})
                                </Button>
                              </motion.div>

                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 90, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              >
                                <Button variant="outline" size="icon" onClick={() => toggleCustomIncrement(task.id)}>
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </motion.div>

                              {/* 自定义增量输入动画 */}
                              <AnimatePresence>
                                {customIncrements[task.id] && (
                                  <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center gap-2"
                                  >
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.1 }}
                                    >
                                      <Input
                                        type="number"
                                        min="1"
                                        max={task.total - task.current}
                                        value={customValues[task.id] || 1}
                                        onChange={(e) =>
                                          setCustomValues((prev) => ({
                                            ...prev,
                                            [task.id]: Number(e.target.value),
                                          }))
                                        }
                                        className="w-20"
                                      />
                                    </motion.div>
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.2 }}
                                      whileHover={{ scale: 1.05, y: -2 }}
                                      whileTap={{ scale: 0.98 }}
                                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                      <Button
                                        onClick={(e) => addCustomProgress(task.id, e)}
                                        disabled={task.current >= task.total}
                                        size="sm"
                                      >
                                        添加
                                      </Button>
                                    </motion.div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* 添加作业页面 */}
        {currentView === "add" && (
          <motion.div
            key="add"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    添加新作业
                  </CardTitle>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  {[
                    {
                      id: "task-name",
                      label: "作业名称",
                      type: "text",
                      value: newTaskName,
                      onChange: setNewTaskName,
                      placeholder: "输入作业名称",
                    },
                    {
                      id: "task-total",
                      label: "总数量",
                      type: "number",
                      value: newTaskTotal,
                      onChange: setNewTaskTotal,
                      min: "1",
                    },
                    {
                      id: "task-increment",
                      label: "默认增量",
                      type: "number",
                      value: newTaskIncrement,
                      onChange: setNewTaskIncrement,
                      min: "1",
                    },
                  ].map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    >
                      <Label htmlFor={field.id}>{field.label}</Label>
                      <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        <Input
                          id={field.id}
                          type={field.type}
                          min={field.min}
                          placeholder={field.placeholder}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(field.type === "number" ? Number(e.target.value) : e.target.value)
                          }
                          onKeyDown={(e) => e.key === "Enter" && addTask()}
                          className="transition-all duration-300 focus:shadow-md"
                        />
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Button onClick={addTask} className="w-full transition-all duration-300 hover:shadow-lg" size="lg">
                      <motion.div animate={{ rotate: [0, 180, 360] }} transition={{ duration: 0.5 }} className="mr-2">
                        <Plus className="w-4 h-4" />
                      </motion.div>
                      添加作业
                    </Button>
                  </motion.div>

                  <div className="text-center">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      
                    </motion.div>
                  </div>
                </motion.div>

                {/* 添加作业的说明 */}
                <motion.div
                  className="bg-blue-50 p-4 rounded-lg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <h4 className="font-medium mb-2">使用说明：</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • <strong>作业名称</strong>：输入您要完成的作业名称
                    </li>
                    <li>
                      • <strong>总数量</strong>：设置这个作业需要完成的总量（如题目数、页数等）
                    </li>
                    <li>
                      • <strong>默认增量</strong>：每次点击"完成"按钮时增加的进度数量
                    </li>
                    <li>
                      • <strong>修改进度</strong>：可以在编辑作业时直接修改当前进度
                    </li>
                  </ul>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 粒子效果 */}
      <ParticleEffects
        trigger={particles.show}
        x={particles.x}
        y={particles.y}
        particleCount={particleCount}
        onComplete={() => setParticles({ show: false, x: 0, y: 0 })}
      />

      {/* 编辑任务对话框 */}
      <EditTaskDialog
        task={editingTask}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={saveEditedTask}
      />
    </div>
  )
}
