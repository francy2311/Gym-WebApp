ALTER TABLE exercises ALTER COLUMN user_id DROP NOT NULL;

WITH catalog(name, muscle_group, equipment, description) AS (
    VALUES
        ('Corsa', 'CARDIO', 'BODYWEIGHT', 'Corsa a ritmo continuo, su percorso all’aperto.'),
        ('Camminata veloce', 'CARDIO', 'BODYWEIGHT', 'Camminata a passo sostenuto e regolare.'),
        ('Cyclette', 'CARDIO', 'MACHINE', 'Pedalata su bici stazionaria con resistenza regolabile.'),
        ('Salto con la corda', 'CARDIO', 'OTHER', 'Salti ritmici coordinati con il passaggio della corda.'),
        ('Vogatore', 'CARDIO', 'MACHINE', 'Remata al vogatore che combina la spinta delle gambe e la tirata delle braccia.'),
        ('Squat a corpo libero', 'LEGS', 'BODYWEIGHT', 'Piegamento di anche e ginocchia seguito dal ritorno in piedi.'),
        ('Affondi in avanti', 'LEGS', 'BODYWEIGHT', 'Passo in avanti con piegamento delle gambe e ritorno alla posizione iniziale.'),
        ('Leg press', 'LEGS', 'MACHINE', 'Spinta della pedana con le gambe dalla posizione seduta.'),
        ('Calf raise in piedi', 'LEGS', 'BODYWEIGHT', 'Sollevamento dei talloni per lavorare sui polpacci.'),
        ('Ponte glutei', 'GLUTES', 'BODYWEIGHT', 'Sollevamento del bacino da supini, con ginocchia piegate e piedi a terra.'),
        ('Stacco rumeno con manubri', 'LEGS', 'DUMBBELL', 'Flessione delle anche con manubri vicini alle gambe e ginocchia leggermente piegate.'),
        ('Piegamenti sulle braccia', 'CHEST', 'BODYWEIGHT', 'Discesa e risalita del busto in appoggio su mani e punte dei piedi.'),
        ('Panca piana con bilanciere', 'CHEST', 'BARBELL', 'Distensione del bilanciere da sdraiati su panca piana.'),
        ('Rematore con manubrio', 'BACK', 'DUMBBELL', 'Tirata del manubrio verso il fianco con il busto inclinato.'),
        ('Lat machine avanti', 'BACK', 'MACHINE', 'Tirata della barra verso la parte alta del petto da seduti.'),
        ('Trazioni alla sbarra', 'BACK', 'BODYWEIGHT', 'Sollevamento del corpo verso la sbarra con una tirata delle braccia.'),
        ('Shoulder press con manubri', 'SHOULDERS', 'DUMBBELL', 'Distensione dei manubri dalle spalle fino a sopra la testa.'),
        ('Alzate laterali', 'SHOULDERS', 'DUMBBELL', 'Sollevamento laterale dei manubri con i gomiti leggermente piegati.'),
        ('Curl con manubri', 'BICEPS', 'DUMBBELL', 'Flessione dei gomiti per sollevare i manubri verso le spalle.'),
        ('Pushdown al cavo', 'TRICEPS', 'CABLE', 'Estensione dei gomiti spingendo la maniglia del cavo verso il basso.'),
        ('Plank sugli avambracci', 'ABS', 'BODYWEIGHT', 'Tenuta statica con avambracci e punte dei piedi a terra.'),
        ('Dead bug', 'ABS', 'BODYWEIGHT', 'Da supini, estensione alternata di braccio e gamba opposti mantenendo stabile il busto.')
)
INSERT INTO exercises (user_id, name, muscle_group, equipment, description, created_at, updated_at)
SELECT NULL, catalog.name, catalog.muscle_group, catalog.equipment, catalog.description,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog
WHERE NOT EXISTS (
    SELECT 1 FROM exercises existing
    WHERE lower(btrim(existing.name)) = lower(catalog.name)
);
