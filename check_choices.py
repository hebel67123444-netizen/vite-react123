#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查选择题的选项是否被正确提取
"""

import json

def check_choice_questions():
    """检查选择题的选项提取情况"""
    with open('questions.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    total_choice = 0
    with_options = 0
    
    print("=== 选择题选项检查结果 ===")
    
    for i, q in enumerate(data[:10]):  # 只检查前10道题
        if q['type'] == 'choice':
            total_choice += 1
            if q['options']:
                with_options += 1
                print(f"第{i+1}题: {q['content'][:30]}...")
                print(f"  选项数: {len(q['options'])}")
                print(f"  选项: {q['options']}")
                print()
    
    # 统计所有题目
    total_choice_all = len([q for q in data if q['type'] == 'choice'])
    with_options_all = len([q for q in data if q['type'] == 'choice' and q['options']])
    
    print(f"选择题总数: {total_choice_all}")
    print(f"有选项的选择题数: {with_options_all}")
    print(f"选项缺失率: {(total_choice_all - with_options_all) / total_choice_all * 100:.1f}%")

if __name__ == "__main__":
    check_choice_questions()