-- Seed: Default Attainment Thresholds
-- Description: Insert default attainment thresholds for CLO and PLO assessment
-- Created: 2026-02-03
-- Note: These are generic defaults. Adjust per degree program as needed.

-- Insert default thresholds for all active degrees
-- We'll need to get the degree IDs and active session ID first

-- Step 1: Get the current active academic session ID
SET @active_session_id = (
    SELECT id FROM academic_sessions 
    WHERE is_active = TRUE 
    LIMIT 1
);

-- Step 2: Insert default CLO thresholds for all degrees
INSERT INTO attainment_thresholds (
    degree_id,
    threshold_type,
    minimum_percentage,
    target_percentage,
    excellence_percentage,
    effective_from_session_id,
    effective_to_session_id
)
SELECT 
    id as degree_id,
    'clo' as threshold_type,
    60.00 as minimum_percentage,
    75.00 as target_percentage,
    85.00 as excellence_percentage,
    @active_session_id as effective_from_session_id,
    NULL as effective_to_session_id
FROM degrees
WHERE is_active = TRUE
  AND deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM attainment_thresholds 
      WHERE degree_id = degrees.id 
        AND threshold_type = 'clo'
        AND effective_to_session_id IS NULL
  );

-- Step 3: Insert default PLO thresholds for all degrees
INSERT INTO attainment_thresholds (
    degree_id,
    threshold_type,
    minimum_percentage,
    target_percentage,
    excellence_percentage,
    effective_from_session_id,
    effective_to_session_id
)
SELECT 
    id as degree_id,
    'plo' as threshold_type,
    60.00 as minimum_percentage,
    75.00 as target_percentage,
    85.00 as excellence_percentage,
    @active_session_id as effective_from_session_id,
    NULL as effective_to_session_id
FROM degrees
WHERE is_active = TRUE
  AND deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM attainment_thresholds 
      WHERE degree_id = degrees.id 
        AND threshold_type = 'plo'
        AND effective_to_session_id IS NULL
  );

-- Verification: Display inserted thresholds
SELECT 
    at.id,
    d.name as degree_name,
    at.threshold_type,
    at.minimum_percentage,
    at.target_percentage,
    at.excellence_percentage,
    acs.session_name as effective_from
FROM attainment_thresholds at
JOIN degrees d ON at.degree_id = d.id
JOIN academic_sessions acs ON at.effective_from_session_id = acs.id
WHERE at.effective_to_session_id IS NULL
ORDER BY d.name, at.threshold_type;
