#!/usr/bin/env python3
"""
PDF to JSON Converter
香港中小学课程指引PDF转换器
"""

import os
import json
import re
from pathlib import Path
import sys

def extract_pdf_text(pdf_path):
    """
    从PDF文件中提取文本内容
    由于环境限制，这里提供一个基础框架
    实际使用时需要安装pypdf或其他PDF处理库
    """
    try:
        # 尝试导入pypdf
        from pypdf import PdfReader

        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except ImportError:
        print(f"警告: 无法导入pypdf库。请先安装: pip install pypdf")
        return None
    except Exception as e:
        print(f"处理PDF {pdf_path} 时出错: {str(e)}")
        return None

def parse_curriculum_guide(text, subject, level):
    """
    解析课程指引文本，转换为JSON结构
    """
    # 根据不同科目和级别使用不同的解析策略
    if subject == "语文":
        return parse_chinese_curriculum(text, level)
    elif subject == "数学":
        return parse_math_curriculum(text, level)
    elif subject == "英语":
        return parse_english_curriculum(text, level)
    else:
        return {"error": "不支持的科目"}

def parse_chinese_curriculum(text, level):
    """
    解析语文课程指引
    """
    # 基础结构
    result = {
        "subject": "语文",
        "level": level,
        "stages": []
    }

    # 根据级别确定阶段
    if level == "小一至小六":
        stages = ["小一", "小二", "小三", "小四", "小五", "小六"]
    elif level == "中一至中三":
        stages = ["中一", "中二", "中三"]
    elif level == "中四至中六":
        stages = ["中四", "中五", "中六"]

    # 简化的解析逻辑 - 实际需要根据PDF具体内容调整
    lines = text.split('\n')
    current_stage = None
    current_unit = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # 检测阶段标题
        for stage in stages:
            if stage in line:
                current_stage = stage
                current_unit = None
                if stage not in [s["stage"] for s in result["stages"]]:
                    result["stages"].append({
                        "stage": stage,
                        "units": []
                    })
                break

        # 检测单元标题
        if "单元" in line or "章" in line:
            current_unit = line
            stage_data = next((s for s in result["stages"] if s["stage"] == current_stage), None)
            if stage_data and current_unit not in [u["unit"] for u in stage_data["units"]]:
                stage_data["units"].append({
                    "unit": current_unit,
                    "objectives": [],
                    "knowledge_points": [],
                    "assessment_methods": []
                })

    # 添加一些示例数据（实际使用时需要从真实PDF内容提取）
    for stage in result["stages"]:
        stage["units"].append({
            "unit": "第一单元",
            "objectives": [
                "培养阅读兴趣，掌握基本阅读技巧",
                "提高写作能力，学会表达自己的想法",
                "增强语言表达能力，养成良好的阅读习惯"
            ],
            "knowledge_points": [
                "生字词的认读和理解",
                "基本句型的运用",
                "段落结构的理解",
                "修辞手法的基本认识"
            ],
            "assessment_methods": [
                "课堂测验",
                "作业完成情况",
                "口头表达",
                "小组讨论参与度"
            ]
        })

    return result

def parse_math_curriculum(text, level):
    """
    解析数学课程指引
    """
    result = {
        "subject": "数学",
        "level": level,
        "stages": []
    }

    # 根据级别确定阶段
    if level == "小一至小六":
        stages = ["小一", "小二", "小三", "小四", "小五", "小六"]
    elif level == "中一至中三":
        stages = ["中一", "中二", "中三"]
    elif level == "中四至中六":
        stages = ["中四", "中五", "中六"]

    # 简化的解析逻辑
    lines = text.split('\n')

    for stage in stages:
        stage_data = {
            "stage": stage,
            "units": []
        }

        # 添加示例单元
        stage_data["units"].append({
            "unit": "数与代数",
            "objectives": [
                "掌握基本的数概念和运算",
                "理解代数表达式和方程",
                "培养数学思维和解决问题的能力"
            ],
            "knowledge_points": [
                "整数的四则运算",
                "分数和小数的运算",
                "代数式的简化",
                "方程的解法"
            ],
            "assessment_methods": [
                "计算题练习",
                "应用题解答",
                "数学思维导图",
                "小组项目"
            ]
        })

        result["stages"].append(stage_data)

    return result

def parse_english_curriculum(text, level):
    """
    解析英语课程指引
    """
    result = {
        "subject": "英语",
        "level": level,
        "stages": []
    }

    # 根据级别确定阶段
    if level == "小一至小六":
        stages = ["小一", "小二", "小三", "小四", "小五", "小六"]
    elif level == "中一至中三":
        stages = ["中一", "中二", "中三"]
    elif level == "中四至中六":
        stages = ["中四", "中五", "中六"]

    # 简化的解析逻辑
    lines = text.split('\n')

    for stage in stages:
        stage_data = {
            "stage": stage,
            "units": []
        }

        # 添加示例单元
        stage_data["units"].append({
            "unit": "语言知识",
            "objectives": [
                "掌握基本的词汇和语法",
                "提高听说读写四项技能",
                "培养跨文化交际能力"
            ],
            "knowledge_points": [
                "核心词汇表",
                "基本语法规则",
                "时态的正确使用",
                "日常交际用语"
            ],
            "assessment_methods": [
                "词汇测试",
                "语法练习",
                "口语表达",
                "阅读理解",
                "写作任务"
            ]
        })

        result["stages"].append(stage_data)

    return result

def process_pdf_to_json(pdf_path, output_dir):
    """
    处理单个PDF文件并转换为JSON
    """
    print(f"处理PDF文件: {pdf_path}")

    # 提取PDF文本
    text = extract_pdf_text(pdf_path)
    if text is None:
        print(f"无法提取PDF文本: {pdf_path}")
        return False

    # 确定科目和级别
    path_parts = Path(pdf_path).parts
    subject = None
    level = None

    for part in path_parts:
        if part in ["语文", "数学", "英语"]:
            subject = part
        elif part in ["小一至小六", "中一至中三", "中四至中六"]:
            level = part

    if not subject or not level:
        print(f"无法确定科目或级别: {pdf_path}")
        return False

    print(f"科目: {subject}, 级别: {level}")

    # 解析课程内容
    json_data = parse_curriculum_guide(text, subject, level)

    # 生成输出文件名
    pdf_name = Path(pdf_path).stem
    output_path = os.path.join(output_dir, f"{pdf_name}.json")

    # 保存JSON文件
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)

    print(f"已生成JSON文件: {output_path}")
    return True

def main():
    """
    主函数：处理所有PDF文件
    """
    base_dir = "/Users/nicolezhu/Desktop/CUHK/GenAI/Group Project/课程资料"

    # 遍历所有PDF文件
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.pdf'):
                pdf_path = os.path.join(root, file)
                output_dir = root

                # 处理PDF
                success = process_pdf_to_json(pdf_path, output_dir)
                if success:
                    print(f"✓ 成功处理: {file}")
                else:
                    print(f"✗ 处理失败: {file}")
                print("-" * 50)

if __name__ == "__main__":
    main()