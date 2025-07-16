"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"

interface Task {
  id: string
  name: string
  total: number
  current: number
  defaultIncrement: number
  createdDate: string
  lastUpdatedDate?: string // 添加这个字段
  startValue?: number
  includeInTotal?: boolean
}

interface EditTaskDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedTask: Task) => void
}

export function EditTaskDialog({ task, open, onOpenChange, onSave }: EditTaskDialogProps) {
  const [name, setName] = useState("")
  const [total, setTotal] = useState(100)
  const [current, setCurrent] = useState(0)
  const [defaultIncrement, setDefaultIncrement] = useState(1)
  const [startValue, setStartValue] = useState(0)
  const [includeInTotal, setIncludeInTotal] = useState(true)

  // 当对话框打开时，初始化表单数据
  useEffect(() => {
    if (task && open) {
      setName(task.name)
      setTotal(task.total)
      setCurrent(task.current)
      setStartValue(task.startValue || 0)
      setDefaultIncrement(task.defaultIncrement)
      setIncludeInTotal(task.includeInTotal !== false) // 兼容老数据，默认为true
    }
  }, [task, open])

  const handleSave = () => {
    if (!task || name.trim() === "") return

    const today = new Date().toDateString()
    const progressChanged = current !== task.current

    const updatedTask: Task = {
      ...task,
      name: name.trim(),
      total: Math.max(startValue + 1, total), // 确保总数大于起始值
      current: Math.max(startValue, current), // 确保当前值不小于起始值
      startValue: Math.max(0, startValue),
      defaultIncrement: Math.max(1, defaultIncrement),
      includeInTotal, // 添加这一行
      lastUpdatedDate: progressChanged ? today : task.lastUpdatedDate,
    }

    onSave(updatedTask)
    onOpenChange(false)
  }

  if (!task) return null

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle>编辑作业</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {[
                  {
                    id: "edit-name",
                    label: "作业名称",
                    type: "text",
                    value: name,
                    onChange: setName,
                    placeholder: "输入作业名称",
                  },
                  { id: "edit-total", label: "总数量", type: "number", value: total, onChange: setTotal, min: "1" },
                  {
                    id: "edit-current",
                    label: "当前进度",
                    type: "number",
                    value: current,
                    onChange: setCurrent,
                    min: "0",
                    note: "可以直接修改当前进度来纠正误操作",
                  },
                  {
                    id: "edit-increment",
                    label: "默认增量",
                    type: "number",
                    value: defaultIncrement,
                    onChange: setDefaultIncrement,
                    min: "1",
                  },
                  {
                    id: "edit-start-value",
                    label: "起始值",
                    type: "number",
                    value: startValue,
                    onChange: setStartValue,
                    min: "0",
                    note: "设置作业的起始进度值",
                  },
                ].map((field, index) => (
                  <motion.div
                    key={field.id}
                    className="grid gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <Input
                        id={field.id}
                        type={field.type}
                        min={field.min}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(field.type === "number" ? Number(e.target.value) : e.target.value)
                        }
                        placeholder={field.placeholder}
                        className="transition-all duration-300 focus:shadow-md"
                      />
                    </motion.div>
                    {field.note && <p className="text-xs text-muted-foreground">{field.note}</p>}
                  </motion.div>
                ))}
                <motion.div
                  className="grid gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-include-in-total"
                      checked={includeInTotal}
                      onChange={(e) => setIncludeInTotal(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit-include-in-total" className="text-sm font-medium">
                      计入总进度
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">取消勾选后，此任务不会影响总体进度计算</p>
                </motion.div>
              </div>
              <DialogFooter>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={() => onOpenChange(false)} className="transition-all duration-300">
                    取消
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handleSave} className="transition-all duration-300">
                    保存修改
                  </Button>
                </motion.div>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
