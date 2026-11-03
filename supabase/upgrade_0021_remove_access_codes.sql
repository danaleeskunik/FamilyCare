-- 0021: stop holding door codes, alarm codes and Wi-Fi passwords. Removes any answers already saved for these removed questions.
-- Safe to run more than once.
update public.client_intake_private set answers = answers - 'door_code' - 'alarm_code' - 'wifi'
  where answers ?| array['door_code', 'alarm_code', 'wifi'];
update public.client_intake set answers = answers - 'door_code' - 'alarm_code' - 'wifi'
  where answers ?| array['door_code', 'alarm_code', 'wifi'];
