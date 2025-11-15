#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从questions.json中提取所有判断题，保存为单独的题库
"""

import json

def extract_judge_questions():
    """提取判断题并保存"""
    try:
        # 读取原始题目数据
        with open('questions.json', 'r', encoding='utf-8') as f:
            all_questions = json.load(f)
        
        # 提取判断题
        judge_questions = [q for q in all_questions if q['type'] == 'judge']
        
        # 重新编号
        for i, q in enumerate(judge_questions):
            q['id'] = i + 1
        
        # 保存为新的JSON文件
        with open('judge_questions.json', 'w', encoding='utf-8') as f:
            json.dump(judge_questions, f, ensure_ascii=False, indent=2)
        
        print(f"成功提取 {len(judge_questions)} 道判断题")
        print("判断题题库已保存到 judge_questions.json 文件")
        
        return judge_questions
    except Exception as e:
        print(f"提取判断题失败: {e}")
        return []

if __name__ == "__main__":
    extract_judge_questions()