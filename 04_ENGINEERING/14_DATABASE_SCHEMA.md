# DATABASE SCHEMA

## users
- id
- name
- email
- created_at

## projects
- id
- user_id
- title
- task_type: LESSON | CAMPAIGN
- status
- selected_mode
- created_at
- updated_at

## source_files
- id
- project_id
- filename
- mime_type
- storage_key
- page_count
- parse_status
- created_at

## data_packs
- id
- project_id
- version
- status
- payload_json
- created_at

## concepts
- id
- project_id
- mode
- title
- hook
- reason
- payload_json
- is_selected

## scripts
- id
- project_id
- version
- payload_json

## continuity_locks
- id
- project_id
- type: CHARACTER | LOCATION | STYLE
- name
- version
- payload_json

## storyboards
- id
- project_id
- version
- total_duration
- payload_json

## scenes
- id
- project_id
- storyboard_id
- scene_number
- title
- duration_seconds
- purpose
- action
- camera
- dialogue
- image_prompt
- video_prompt
- status
- version

## generation_jobs
- id
- project_id
- scene_id
- type: IMAGE | VIDEO
- provider
- external_operation_id
- status
- error_code
- error_message
- created_at
- updated_at

## assets
- id
- project_id
- scene_id
- job_id
- type
- storage_key
- mime_type
- metadata_json
- is_selected
- created_at

## safety_reports
- id
- project_id
- scene_id nullable
- version
- payload_json

## qc_reports
- id
- project_id
- version
- payload_json
- overall_status

## exports
- id
- project_id
- type
- storage_key
- created_at

## Important constraints
- scene_number unique per storyboard.
- selected asset only one per type/scene unless user chooses variants.
- data pack approved version cannot be mutated; create new version.
