#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
查找所有docx文件中的判断题
"""

from docx import Document
import os

def find_judge_questions():
    """查找所有docx文件中的判断题"""
    docx_files = [f for f in os.listdir('.') if f.endswith('.docx')]
    
    for file in docx_files:
        print(f"\n=== {file} ===")
        doc = Document(file)
        
        found_judge_section = False
        
        for i, para in enumerate(doc.paragraphs):
            text = para.text.strip()
            if not text:
                continue
                
            # 查找判断题标题
            if '判断题' in text:
                print(f"第{i}段: {text} (判断题标题)")
                found_judge_section = True
            elif found_judge_section:
                # 如果已经找到判断题标题，打印后续内容
                print(f"第{i}段: {text}")
                # 只打印前20个段落，避免输出过多
                if i > 20:
                    break

if __name__ == "__main__":
    find_judge_questions()