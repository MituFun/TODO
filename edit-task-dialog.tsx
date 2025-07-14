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

  // 当对话框打开时，初始化表单数据
  useEffect(() => {
    if (task && open) {
      setName(task.name)
      setTotal(task.total)
      setCurrent(task.current)
      setDefaultIncrement(task.defaultIncrement)
    }
  }, [task, open])

  const handleSave = () => {
    if (!task || name.trim() === "") return

    const today = new Date().toDateString()
    const progressChanged = current !== task.current

    const updatedTask: Task = {
      ...task,
      name: name.trim(),
      total: Math.max(1, total),
      current: Math.max(0, current), // 确保进度不小于0
      defaultIncrement: Math.max(1, defaultIncrement),
      lastUpdatedDate: progressChanged ? today : task.lastUpdatedDate, // 如果进度改变了就更新日期
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
