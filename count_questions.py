#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统计题库中各类题目的数量
"""

import json

def count_question_types():
    """统计不同类型题目的数量"""
    try:
        # 读取原始题目数据
        with open('questions.json', 'r', encoding='utf-8') as f:
            all_questions = json.load(f)
        
        # 统计各类题目数量
        type_counts = {}
        for q in all_questions:
            q_type = q['type']
            type_counts[q_type] = type_counts.get(q_type, 0) + 1
        
        print("题目类型统计结果：")
        for q_type, count in type_counts.items():
            print(f"{q_type}题: {count}道")
        
        print(f"\n总题目数: {len(all_questions)}道")
        
        # 检查判断题提取是否完整
        try:
            with open('judge_questions.json', 'r', encoding='utf-8') as f:
                judge_questions = json.load(f)
            print(f"\n单独提取的判断题数量: {len(judge_questions)}道")
            
            if len(judge_questions) < type_counts.get('judge', 0):
                print("警告：单独提取的判断题数量少于原始题库中的判断题数量！")
        except FileNotFoundError:
            print("\n未找到单独的判断题题库文件")
        
        return type_counts
    except Exception as e:
        print(f"统计失败: {e}")
        return {}

if __name__ == "__main__":
    count_question_types()