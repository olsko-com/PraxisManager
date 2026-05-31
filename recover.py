import json
import re

log_path = "/Users/ivenruether/.gemini/antigravity-ide/brain/2954c6ad-ba23-4bb6-9c2d-dd35c87343d8/.system_generated/logs/transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f, 1):
        if not line.strip():
            continue
        try:
            data = json.loads(line)
            step_idx = data.get("step_index", idx)
            
            # Check tool_calls in this step
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                name = tc.get("name", "")
                args = tc.get("args", {})
                if isinstance(args, str):
                    try:
                        args = json.loads(args)
                    except:
                        pass
                
                # Check for write_to_file or replace_file_content targetting page.tsx
                target = args.get("TargetFile", "") or args.get("AbsolutePath", "")
                if "dashboard/page.tsx" in target:
                    content_len = 0
                    code_content = args.get("CodeContent", "")
                    if code_content:
                        content_len = len(code_content)
                    
                    print(f"Step {step_idx}: Tool {name} on {target}. CodeContent len: {content_len}")
                    
                    # If we found a large CodeContent, let's write it to a temp file
                    if code_content and content_len > 10000:
                        temp_out = f"recovered_step_{step_idx}.tsx"
                        with open(temp_out, 'w', encoding='utf-8') as out:
                            out.write(code_content)
                        print(f"  --> Saved CodeContent to {temp_out}")
                        
        except Exception as e:
            # print(f"Error parsing line {idx}: {e}")
            pass
