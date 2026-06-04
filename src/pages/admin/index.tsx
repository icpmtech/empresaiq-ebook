import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@theme/Layout';
import styles from './admin.module.css';
import { validateAdminKey, generateKey, ADMIN_KEY } from '../../utils/keyUtils';
import {
  dbGetAllKeys,
  dbInsertKey,
  dbRevokeKey,
  dbDeleteKey,
  exportDB,
  type DBKeyRecord,
} from '../../utils/db';

const LS_ADMIN_AUTH = 'empresaiq_admin_auth';

export default function AdminPage(): React.JSX.Element {
  const [authed, setAuthed] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState(false);

  const [keys, setKeys] = useState<DBKeyRecord[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'revoked'>('all');

  // Persist admin session in sessionStorage (cleared on tab close)
  useEffect(() => {
    if (sessionStorage.getItem(LS_ADMIN_AUTH) === ADMIN_KEY) {
      setAuthed(true);
    }
  }, []);

  const loadKeys = useCallback(async () => {
    setDbLoading(true);
    try {
      setKeys(await dbGetAllKeys());
    } finally {
      setDbLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) loadKeys();
  }, [authed, loadKeys]);

  function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (validateAdminKey(adminInput)) {
      sessionStorage.setItem(LS_ADMIN_AUTH, ADMIN_KEY);
      setAuthed(true);
      setAdminError(false);
    } else {
      setAdminError(true);
    }
  }

  async function handleGenerate() {
    const key = generateKey();
    const label = newLabel.trim() || `Chave ${new Date().toLocaleDateString('pt-PT')}`;
    await dbInsertKey(key, label);
    setNewLabel('');
    loadKeys();
  }

  async function handleCopy(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = key;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  }

  async function handleRevoke(key: string) {
    await dbRevokeKey(key);
    loadKeys();
  }

  async function handleDelete(key: string) {
    if (window.confirm(`Eliminar chave ${key}? Esta ação não pode ser desfeita.`)) {
      await dbDeleteKey(key);
      loadKeys();
    }
  }

  function handleExportCSV() {
    const rows = [['Chave', 'Descrição', 'Criada em', 'Estado']];
    keys.forEach(r => rows.push([
      r.key,
      r.label,
      new Date(r.created_at).toLocaleString('pt-PT'),
      r.revoked ? 'Revogada' : 'Ativa',
    ]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `empresaiq-chaves-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = keys.filter(r => {
    if (filter === 'active') return !r.revoked;
    if (filter === 'revoked') return r.revoked;
    return true;
  });

  const activeCount = keys.filter(r => !r.revoked).length;
  const revokedCount = keys.filter(r => r.revoked).length;

  // ── Auth Gate ────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <Layout title="Admin — EmpresaIQ" description="Painel de administração">
        <main className={styles.main}>
          <div className={styles.authCard}>
            <div className={styles.authIcon}>🔐</div>
            <h1 className={styles.authTitle}>Área de Administração</h1>
            <p className={styles.authSub}>Introduz a chave de administrador para continuar.</p>
            <form onSubmit={handleAdminLogin} className={styles.authForm}>
              <input
                type="password"
                value={adminInput}
                onChange={e => { setAdminInput(e.target.value); setAdminError(false); }}
                placeholder="Chave de administrador"
                className={`${styles.authInput} ${adminError ? styles.inputError : ''}`}
                autoComplete="off"
              />
              {adminError && <p className={styles.errorMsg}>❌ Chave inválida.</p>}
              <button type="submit" className={styles.authBtn}>Entrar →</button>
            </form>
          </div>
        </main>
      </Layout>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  return (
    <Layout title="Admin — EmpresaIQ" description="Painel de administração">
      <main className={styles.main}>
        <div className={styles.dashboard}>

          {/* Header */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>⚙️ Painel de Administração</h1>
              <p className={styles.subtitle}>Gere as chaves de acesso ao EmpresaIQ</p>
            </div>
            <button
              className={styles.logoutBtn}
              onClick={() => { sessionStorage.removeItem(LS_ADMIN_AUTH); setAuthed(false); }}
            >
              Sair
            </button>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{dbLoading ? '…' : keys.length}</span>
              <span className={styles.statLabel}>Total de chaves</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statNum} ${styles.green}`}>{dbLoading ? '…' : activeCount}</span>
              <span className={styles.statLabel}>Ativas</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statNum} ${styles.red}`}>{dbLoading ? '…' : revokedCount}</span>
              <span className={styles.statLabel}>Revogadas</span>
            </div>
          </div>

          {/* Admin key info */}
          <div className={styles.infoBox}>
            <strong>🔑 Chave de admin:</strong>{' '}
            <code className={styles.adminKeyCode}>{ADMIN_KEY}</code>
            <span className={styles.infoNote}> — Guarda esta chave em segurança.</span>
          </div>

          {/* Generate section */}
          <div className={styles.generateCard}>
            <h2 className={styles.sectionTitle}>Gerar Nova Chave</h2>
            <div className={styles.generateRow}>
              <input
                type="text"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Descrição (ex: João Silva — compra 04/06/2026)"
                className={styles.labelInput}
              />
              <button onClick={handleGenerate} className={styles.generateBtn}>
                ✨ Gerar Chave
              </button>
            </div>
            {keys.length > 0 && keys[0] && !keys[0].revoked && (
              <div className={styles.lastGenerated}>
                <span className={styles.lastLabel}>Última gerada:</span>
                <code className={styles.keyCode}>{keys[0].key}</code>
                <button
                  className={styles.copyBtn}
                  onClick={() => handleCopy(keys[0].key)}
                >
                  {copiedKey === keys[0].key ? '✅ Copiado!' : '📋 Copiar'}
                </button>
              </div>
            )}
          </div>

          {/* Keys table */}
          <div className={styles.keysSection}>
            <div className={styles.keysHeader}>
              <h2 className={styles.sectionTitle}>Chaves Geradas ({filtered.length})</h2>
              <div className={styles.keysActions}>
                <div className={styles.filterTabs}>
                  {(['all', 'active', 'revoked'] as const).map(f => (
                    <button
                      key={f}
                      className={`${styles.filterTab} ${filter === f ? styles.filterActive : ''}`}
                      onClick={() => setFilter(f)}
                    >
                      {f === 'all' ? 'Todas' : f === 'active' ? 'Ativas' : 'Revogadas'}
                    </button>
                  ))}
                </div>
                {keys.length > 0 && (
                  <>
                    <button className={styles.exportBtn} onClick={handleExportCSV}>
                      📥 Exportar CSV
                    </button>
                    <button className={styles.exportBtn} onClick={exportDB} title="Descarrega o ficheiro SQLite">
                      🗄️ Exportar BD
                    </button>
                  </>
                )}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>Nenhuma chave gerada ainda. Usa o formulário acima para criar a primeira.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.keysTable}>
                  <thead>
                    <tr>
                      <th>Chave</th>
                      <th>Descrição</th>
                      <th>Data</th>
                      <th>Estado</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => (
                      <tr key={r.key} className={r.revoked ? styles.rowRevoked : ''}>
                        <td>
                          <code className={styles.keyCode}>{r.key}</code>
                        </td>
                        <td className={styles.labelCell}>{r.label}</td>
                        <td className={styles.dateCell}>
                          {new Date(r.created_at).toLocaleDateString('pt-PT')}
                        </td>
                        <td>
                          <span className={r.revoked ? styles.badgeRevoked : styles.badgeActive}>
                            {r.revoked ? '🚫 Revogada' : '✅ Ativa'}
                          </span>
                        </td>
                        <td className={styles.actionCell}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleCopy(r.key)}
                            title="Copiar"
                          >
                            {copiedKey === r.key ? '✅' : '📋'}
                          </button>
                          {!r.revoked && (
                            <button
                              className={`${styles.actionBtn} ${styles.revokeBtn}`}
                              onClick={() => handleRevoke(r.key)}
                              title="Revogar"
                            >
                              🚫
                            </button>
                          )}
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDelete(r.key)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* How it works */}
          <div className={styles.howItWorks}>
            <h2 className={styles.sectionTitle}>Como funciona</h2>
            <ol className={styles.howList}>
              <li>Gera uma chave com uma descrição identificativa (ex: nome do cliente).</li>
              <li>Copia a chave e envia ao cliente por email após o pagamento.</li>
              <li>O cliente usa a chave em <strong>/aceder</strong> para descarregar o eBook.</li>
              <li>O cliente usa a mesma chave em <strong>/curso</strong> para aceder ao curso.</li>
              <li>Podes revogar uma chave a qualquer momento se necessário.</li>
            </ol>
            <div className={styles.keyFormat}>
              <strong>Formato das chaves:</strong>{' '}
              <code>EIQ-XXXXXX-YYYYYY</code> — validação algorítmica. Dados persistidos em SQLite (IndexedDB).
            </div>
          </div>

        </div>
      </main>
    </Layout>
  );
}
