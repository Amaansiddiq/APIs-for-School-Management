const db = require('../db/index');
const calculateDistance = require('../routes/distance');

exports.addSchool = (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).send({ error: 'Invalid input' });
  }

  const sql = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, address, latitude, longitude], (err, result) => {
    if (err) return res.status(500).send({ error: 'DB error' });
    res.status(201).send({ message: 'School added', id: result.insertId });
  });
};

exports.listSchools = (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).send({ error: 'Invalid coordinates' });
  }

  db.query('SELECT * FROM schools', (err, results) => {
    if (err) return res.status(500).send({ error: 'DB read error' });

    const sorted = results.map(s => ({
      ...s,
      distance: calculateDistance(userLat, userLon, s.latitude, s.longitude)
    })).sort((a, b) => a.distance - b.distance);

    res.send(sorted);
  });
};
