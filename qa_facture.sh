#!/usr/bin/env bash
set -euo pipefail

BASE="http://127.0.0.1:8000/api"

ADMIN_TOKEN="$(curl -s -X POST "$BASE/login" -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"email":"admin@akrapidtrans.com","password":"Admin@1234"}' | php -r '$j=json_decode(stream_get_contents(STDIN),true); echo $j["token"] ?? "";')"
CLIENT_TOKEN="$(curl -s -X POST "$BASE/login" -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"email":"client@akrapidtrans.com","password":"client@1234"}' | php -r '$j=json_decode(stream_get_contents(STDIN),true); echo $j["token"] ?? "";')"

echo "TOKENS admin=${#ADMIN_TOKEN} client=${#CLIENT_TOKEN}"

CLIENT_CREATED="$(curl -s -X POST "$BASE/client/commandes" -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Authorization: Bearer $CLIENT_TOKEN" -d '{"lieu_depart":"Casa","lieu_arrivee":"Rabat","date_transport":"2026-05-10","prix":350}')"
CLIENT_CMD_ID="$(printf '%s' "$CLIENT_CREATED" | php -r '$j=json_decode(stream_get_contents(STDIN),true); echo $j["id"] ?? "";')"
printf 'Client created commande id: %s\n' "$CLIENT_CMD_ID"

printf 'Generate pending facture (expect 422): '
curl -s -o /tmp/facture_generate_pending.json -w '%{http_code}\n' -X POST "$BASE/admin/commandes/$CLIENT_CMD_ID/facture/generate" -H 'Accept: application/json' -H "Authorization: Bearer $ADMIN_TOKEN"

printf 'Download missing facture (expect 404): '
curl -s -o /tmp/facture_missing_download.json -w '%{http_code}\n' -H 'Accept: application/json' -H "Authorization: Bearer $CLIENT_TOKEN" "$BASE/commandes/$CLIENT_CMD_ID/facture/download"

printf 'Admin validates commande: '
curl -s -o /tmp/facture_validate_cmd.json -w '%{http_code}\n' -X PUT "$BASE/admin/commandes/$CLIENT_CMD_ID" -H 'Accept: application/json' -H 'Content-Type: application/json' -H "Authorization: Bearer $ADMIN_TOKEN" -d '{"statut":"validee"}'

printf 'Generate validated facture (expect 200): '
curl -s -o /tmp/facture_generate_ok.json -w '%{http_code}\n' -X POST "$BASE/admin/commandes/$CLIENT_CMD_ID/facture/generate" -H 'Accept: application/json' -H "Authorization: Bearer $ADMIN_TOKEN"

printf 'Generate existing facture again (expect 200): '
curl -s -o /tmp/facture_generate_again.json -w '%{http_code}\n' -X POST "$BASE/admin/commandes/$CLIENT_CMD_ID/facture/generate" -H 'Accept: application/json' -H "Authorization: Bearer $ADMIN_TOKEN"

FACT1="$(php -r '$j=json_decode(file_get_contents("/tmp/facture_generate_ok.json"),true); echo $j["facture"]["facture_number"] ?? "";')"
FACT2="$(php -r '$j=json_decode(file_get_contents("/tmp/facture_generate_again.json"),true); echo $j["facture"]["facture_number"] ?? "";')"
CREATED2="$(php -r '$j=json_decode(file_get_contents("/tmp/facture_generate_again.json"),true); echo json_encode($j["created"] ?? null);')"
printf 'Facture number first: %s\n' "$FACT1"
printf 'Facture number second: %s\n' "$FACT2"
printf 'Second call created flag: %s\n' "$CREATED2"

printf 'Admin download facture (expect 200): '
curl -s -o /tmp/facture_admin_download.pdf -w '%{http_code}\n' -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/commandes/$CLIENT_CMD_ID/facture/download"

printf 'Client own download facture (expect 200): '
curl -s -o /tmp/facture_client_download.pdf -w '%{http_code}\n' -H "Authorization: Bearer $CLIENT_TOKEN" "$BASE/commandes/$CLIENT_CMD_ID/facture/download"

printf 'Unauthenticated download (expect 401): '
curl -s -o /tmp/facture_unauth_download.json -w '%{http_code}\n' "$BASE/commandes/$CLIENT_CMD_ID/facture/download"

OTHER_CREATE="$(curl -s -X POST "$BASE/admin/commandes" -H 'Accept: application/json' -H 'Content-Type: application/json' -H "Authorization: Bearer $ADMIN_TOKEN" -d '{"client_id":1,"camion_id":null,"lieu_depart":"Meknes","lieu_arrivee":"Fes","date_transport":"2026-05-11","prix":220,"statut":"validee","user_id":null}')"
OTHER_CMD_ID="$(printf '%s' "$OTHER_CREATE" | php -r '$j=json_decode(stream_get_contents(STDIN),true); echo $j["id"] ?? "";')"
printf 'Other commande id: %s\n' "$OTHER_CMD_ID"
printf 'Generate other facture: '
curl -s -o /tmp/facture_other_generate.json -w '%{http_code}\n' -X POST "$BASE/admin/commandes/$OTHER_CMD_ID/facture/generate" -H 'Accept: application/json' -H "Authorization: Bearer $ADMIN_TOKEN"
printf 'Client other download (expect 403): '
curl -s -o /tmp/facture_client_forbidden.json -w '%{http_code}\n' -H 'Accept: application/json' -H "Authorization: Bearer $CLIENT_TOKEN" "$BASE/commandes/$OTHER_CMD_ID/facture/download"
