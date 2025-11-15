#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
解析docx文件中的题目，支持选择题和判断题
"""

from docx import Document
import json
import os
import re

def parse_docx(file_path):
    """解析单个docx文件，提取题目信息"""
    doc = Document(file_path)
    questions = []
    current_question = None
    current_type = None
    
    # 遍历所有段落
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
            
        # 检测题型标题
        if "单选题" in text or "选择题" in text:
            current_type = "choice"
            continue
        elif "判断题" in text:
            current_type = "judge"
            continue
            
        # 检测题目
        if current_type:
            # 处理有答案的格式（如：题目内容（A））
            if "（" in text and "）" in text:
                # 如果有当前题目未完成，先保存
                if current_question:
                    questions.append(current_question)
                    
                # 提取答案
                answer_match = re.search(r'\（\s*([A-Za-z])\s*\）', text)
                answer = answer_match.group(1) if answer_match else ""
                
                # 提取题目内容（去除答案部分）
                content = re.sub(r'\s*\（\s*[A-Za-z]\s*\）\s*', '', text)
                
                # 创建新题目
                current_question = {
                    "id": len(questions) + 1,
                    "type": current_type,
                    "content": content,
                    "options": [],
                    "answer": answer,
                    "analysis": ""
                }
            
            # 处理带分数的格式（如：题目内容[0.5]）
            elif current_type == "judge" and "[" in text and "]" in text:
                # 如果有当前题目未完成，先保存
                if current_question:
                    questions.append(current_question)
                    
                # 提取题目内容（去除分数部分）
                content = re.sub(r'\s*\[.*?\]\s*', '', text)
                
                # 创建新题目
                current_question = {
                    "id": len(questions) + 1,
                    "type": current_type,
                    "content": content,
                    "options": [],
                    "answer": "",  # 这种格式没有答案，留空
                    "analysis": ""
                }
        
        # 处理选项（没有A. B. C. D.前缀，直接添加）
        if current_question and current_question["type"] == "choice" and len(current_question["options"]) < 4:
            # 跳过空行和已有的题目行
            if not re.search(r'\（\s*[A-Za-z]\s*\）', text) and text and not ("[" in text and "]" in text):
                current_question["options"].append(text)
        
        # 处理判断题选项
        if current_question and current_question["type"] == "judge":
            # 判断题不需要额外的选项，因为只有对/错两个选择
            # 这里我们直接设置默认选项，避免题目因为缺少选项而被跳过
            current_question["options"] = ["对", "错"]
    
    # 添加最后一个题目
    if current_question:
        # 确保判断题有默认选项
        if current_question["type"] == "judge" and not current_question["options"]:
            current_question["options"] = ["对", "错"]
        questions.append(current_question)
    
    return questions

def main():
    """主函数，解析所有docx文件并生成JSON"""
    docx_files = [f for f in os.listdir('.') if f.endswith('.docx')]
    all_questions = []
    
    for file in docx_files:
        print(f"解析文件: {file}")
        questions = parse_docx(file)
        all_questions.extend(questions)
    
    # 重新编号
    for i, q in enumerate(all_questions):
        q["id"] = i + 1
    
    # 保存为JSON文件
    with open('questions.json', 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
    
    print(f"\n解析完成！共提取 {len(all_questions)} 道题目")
    print("题目数据已保存到 questions.json 文件")

if __name__ == "__main__":
    main()