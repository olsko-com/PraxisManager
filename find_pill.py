import json

log_path = "/Users/ivenruether/.gemini/antigravity-ide/brain/de85bba1-5d47-4a4c-a8f2-14d6520b4196/.system_generated/logs/transcript.jsonl"
out_path = "/Users/ivenruether/.gemini/antigravity-ide/scratch/onboarding_history.txt"

with open(log_path, 'r', encoding='utf-8') as f, open(out_path, 'w', encoding='utf-8') as out:
    for idx, line in enumerate(f, 1):
        try:
            data = json.loads(line)
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                args = tc.get("args", {})
                if isinstance(args, str):
                    try:
                        args = json.loads(args)
                    except:
                        continue
                
                target = args.get("TargetFile", "")
                if "onboarding/page.tsx" in target or "onboarding" in target:
                    out.write(f"=== Step {data.get('step_index', idx)} tool {tc.get('name')} target {target} ===\n")
                    # Check what content was written
                    content = args.get("CodeContent", "") or args.get("ReplacementContent", "")
                    if "ReplacementChunks" in args:
                        chunks = args["ReplacementChunks"]
                        if isinstance(chunks, str):
                            chunks = json.loads(chunks)
                        content = "\n".join([chunk.get("ReplacementContent", "") for chunk in chunks])
                    
                    lines = content.split("\n")
                    for i, l in enumerate(lines):
                        if "Vorschau" in l or "preview" in l or "Eye" in l or "absolute top-8" in l or "badge" in l:
                            start = max(0, i-4)
                            end = min(len(lines), i+12)
                            out.write(f"  Match at line {i}:\n")
                            for j in range(start, end):
                                out.write(f"    {j}: {lines[j]}\n")
                            out.write("  -----------------\n")
        except Exception as e:
            pass

print("Done writing onboarding modifications history")
